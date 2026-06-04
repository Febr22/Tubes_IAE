from rest_framework import serializers
from .models import Order, OrderItem
from apps.app_katalog.models import Produk

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

    class Meta:
        model = Order
        fields = ['id', 'pembeli_id', 'total_harga', 'status', 'catatan', 'tanggal_pesan', 'items', 'items_input', 'laptop_id', 'jumlah', 'discount', 'payment_info']
        read_only_fields = ['pembeli_id', 'status', 'total_harga', 'tanggal_pesan']

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
                }
        except Exception:
            pass
        return None

    def create(self, validated_data):
        items_input = validated_data.pop('items_input', None)
        laptop_id = validated_data.pop('laptop_id', None)
        jumlah = validated_data.pop('jumlah', None)
        discount = validated_data.pop('discount', 0)
        
        items_to_process = []
        if items_input:
            items_to_process = items_input
        elif laptop_id is not None and jumlah is not None:
            items_to_process = [{'laptop_id': laptop_id, 'jumlah': jumlah}]
        else:
            raise serializers.ValidationError("Harus menyertakan 'items_input' atau 'laptop_id' dan 'jumlah'.")
            
        if not items_to_process:
            raise serializers.ValidationError("Daftar produk pesanan kosong.")

        total_harga = 0
        resolved_items = []
        
        for item in items_to_process:
            l_id = item['laptop_id']
            qty = item['jumlah']
            try:
                produk = Produk.objects.get(id=l_id)
            except Produk.DoesNotExist:
                raise serializers.ValidationError({"laptop_id": f"Produk laptop dengan ID {l_id} tidak ditemukan."})
            
            # Validasi stok
            if produk.stok < qty:
                raise serializers.ValidationError({"stok": f"Stok produk '{produk.nama}' tidak mencukupi (Tersedia: {produk.stok}, Diminta: {qty})."})
                
            total_harga += produk.harga * qty
            resolved_items.append({
                'produk': produk,
                'jumlah': qty,
                'harga_saat_beli': produk.harga
            })

        # Kurangi diskon
        total_harga = total_harga - discount
        if total_harga < 0:
            total_harga = 0

        pembeli_id = self.context['request'].user.id if self.context.get('request') and self.context['request'].user else 1
        
        order = Order.objects.create(
            pembeli_id=pembeli_id,
            total_harga=total_harga,
            status='pending',
            catatan=validated_data.get('catatan', '')
        )
        
        for item in resolved_items:
            OrderItem.objects.create(
                order=order,
                laptop_id=item['produk'].id,
                jumlah=item['jumlah'],
                harga_saat_beli=item['harga_saat_beli']
            )
            
        return order

