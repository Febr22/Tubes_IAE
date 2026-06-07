from django.contrib import admin
from django.utils import timezone
from .models import Order, OrderItem
from apps.app_pembayaran.models import Pembayaran

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('laptop_id', 'jumlah', 'harga_saat_beli')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_pembeli_email', 'get_pembeli_telepon', 'total_harga_formatted', 'status', 'get_alamat_pengiriman', 'tanggal_pesan')
    list_filter = ('status', 'tanggal_pesan')
    search_fields = ('id', 'pembeli_id')
    readonly_fields = ('pembeli_id', 'get_pembeli_email', 'get_pembeli_telepon', 'get_alamat_pengiriman', 'total_harga', 'tanggal_pesan')
    inlines = [OrderItemInline]

    def total_harga_formatted(self, obj):
        return f"Rp {int(obj.total_harga):,}".replace(",", ".")
    total_harga_formatted.short_description = 'Total Harga'

    def get_pembeli_email(self, obj):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=obj.pembeli_id)
            return user.email
        except User.DoesNotExist:
            return "User tidak ditemukan"
    get_pembeli_email.short_description = 'Email Pembeli'

    def get_pembeli_telepon(self, obj):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=obj.pembeli_id)
            return user.no_telepon or "-"
        except User.DoesNotExist:
            return "-"
    get_pembeli_telepon.short_description = 'No. Telepon'

    def get_alamat_pengiriman(self, obj):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=obj.pembeli_id)
            return user.alamat_utama or "Belum diatur"
        except User.DoesNotExist:
            return "User tidak ditemukan"
    get_alamat_pengiriman.short_description = 'Alamat Pengiriman'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # Sync to Pembayaran
        pembayaran, created = Pembayaran.objects.get_or_create(order_id=obj.id)
        if obj.status in ['diproses', 'dikirim', 'selesai']:
            pembayaran.is_lunas = True
            pembayaran.status_transaksi = 'settlement'
            if not pembayaran.tanggal_konfirmasi:
                pembayaran.tanggal_konfirmasi = timezone.now()
        elif obj.status == 'dibatalkan':
            pembayaran.is_lunas = False
            pembayaran.status_transaksi = 'cancel'
            pembayaran.tanggal_konfirmasi = None
        else:
            pembayaran.is_lunas = False
            pembayaran.status_transaksi = 'pending'
            pembayaran.tanggal_konfirmasi = None
        pembayaran.save()
