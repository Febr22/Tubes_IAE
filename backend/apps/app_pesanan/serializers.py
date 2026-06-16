from rest_framework import serializers
from .models import Order, OrderItem
from apps.app_katalog.models import Produk
from apps.app_users.models import Alamat

class OrderItemSerializer(serializers.ModelSerializer):
    laptop_nama = serializers.SerializerMethodField()
    laptop_gambar = serializers.SerializerMethodField()
    laptop_slug = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'laptop_id', 'jumlah', 'harga_saat_beli', 'laptop_nama', 'laptop_gambar', 'laptop_slug']

    def get_laptop_nama(self, obj):
        try:
            produk = Produk.objects.get(id=obj.laptop_id)
            return produk.nama
        except Produk.DoesNotExist:
            return f"Laptop ID {obj.laptop_id}"

    def get_laptop_gambar(self, obj):
        try:
            produk = Produk.objects.get(id=obj.laptop_id)
            return produk.gambar.url if produk.gambar else None
        except Produk.DoesNotExist:
            return None

    def get_laptop_slug(self, obj):
        try:
            produk = Produk.objects.get(id=obj.laptop_id)
            return produk.slug
        except Produk.DoesNotExist:
            return ""

class OrderItemInputSerializer(serializers.Serializer):
    laptop_id = serializers.IntegerField()
    jumlah = serializers.IntegerField(min_value=1)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment_info = serializers.SerializerMethodField()
    
    # Input data untuk create order
    items_input = OrderItemInputSerializer(many=True, write_only=True, required=False)
    laptop_id = serializers.IntegerField(write_only=True, required=False)
    jumlah = serializers.IntegerField(write_only=True, min_value=1, required=False)
    discount = serializers.IntegerField(write_only=True, required=False, default=0)
    
    # ID untuk snapshot alamat
    alamat_pengiriman_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = Order
        fields = [
            'id', 'pembeli_id', 'total_harga', 'status', 'catatan', 'tanggal_pesan', 
            'items', 'items_input', 'laptop_id', 'jumlah', 'discount', 'payment_info',
            'alamat_pengiriman', 'alamat_pengiriman_id', 'provinsi', 'kota', 
            'kurir', 'layanan', 'ongkos_kirim', 'resi'
        ]
        read_only_fields = ['pembeli_id', 'status', 'total_harga', 'tanggal_pesan', 'resi', 'alamat_pengiriman']

    def get_payment_info(self, obj):
        from apps.app_pembayaran.models import Pembayaran
        try:
            pembayaran = Pembayaran.objects.filter(order_id=obj.id).first()
            if pembayaran:
                return {
                    "is_lunas": pembayaran.is_lunas,
                    "snap_token": pembayaran.snap_token,
                    "status_transaksi": pembayaran.status_transaksi,
                    "metode_pembayaran_midtrans": pembayaran.metode_pembayaran_midtrans,
                    "gross_amount": pembayaran.gross_amount,
                    "bukti_bayar": pembayaran.bukti_bayar.url if pembayaran.bukti_bayar else None,
                    "metode": pembayaran.metode,
                }
        except Exception:
            pass
        return None

    def create(self, validated_data):
        items_input = validated_data.pop('items_input', None)
        laptop_id = validated_data.pop('laptop_id', None)
        jumlah = validated_data.pop('jumlah', None)
        discount = validated_data.pop('discount', 0)
        alamat_id = validated_data.pop('alamat_pengiriman_id')
        
        # Ambil data logistik yang dikirim dari frontend
        provinsi = validated_data.pop('provinsi', '')
        kota = validated_data.pop('kota', '')
        kurir = validated_data.pop('kurir', '')
        layanan = validated_data.pop('layanan', '')
        ongkos_kirim = validated_data.pop('ongkos_kirim', 0)
        
        items_to_process = []
        if items_input:
            items_to_process = items_input
        elif laptop_id is not None and jumlah is not None:
            items_to_process = [{'laptop_id': laptop_id, 'jumlah': jumlah}]
        else:
            raise serializers.ValidationError("Harus menyertakan 'items_input' atau 'laptop_id' dan 'jumlah'.")
            
        pembeli_id = self.context['request'].user.id if self.context.get('request') and self.context['request'].user else 1

        # --- LOGIKA SNAPSHOT ALAMAT ---
        try:
            alamat_obj = Alamat.objects.get(id=alamat_id, user_id=pembeli_id)
            teks_alamat = f"{alamat_obj.nama_penerima} | {alamat_obj.no_telepon}\n{alamat_obj.alamat_lengkap}, {alamat_obj.kota_kabupaten}, {alamat_obj.provinsi}, {alamat_obj.kode_pos}"
        except Alamat.DoesNotExist:
            raise serializers.ValidationError({"alamat_pengiriman_id": "Alamat tidak valid atau bukan milik Anda."})

        total_harga = 0
        resolved_items = []
        
        for item in items_to_process:
            produk = Produk.objects.get(id=item['laptop_id'])
            if produk.stok < item['jumlah']:
                raise serializers.ValidationError({"stok": f"Stok {produk.nama} tidak cukup."})
            total_harga += produk.harga * item['jumlah']
            resolved_items.append({'produk': produk, 'jumlah': item['jumlah'], 'harga': produk.harga})

        total_harga = (total_harga - discount) + float(ongkos_kirim)
        
        # Buat Order dengan menggabungkan snapshot dan logistik
        order = Order.objects.create(
            pembeli_id=pembeli_id,
            total_harga=total_harga if total_harga > 0 else 0,
            status='pending',
            catatan=validated_data.get('catatan', ''),
            alamat_pengiriman=teks_alamat,
            provinsi=provinsi,
            kota=kota,
            kurir=kurir,
            layanan=layanan,
            ongkos_kirim=ongkos_kirim
        )
        
        for item in resolved_items:
            OrderItem.objects.create(order=order, laptop_id=item['produk'].id, jumlah=item['jumlah'], harga_saat_beli=item['harga'])
            
        return order