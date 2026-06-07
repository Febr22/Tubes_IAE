from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import Pembayaran
from apps.app_pesanan.models import Order

@admin.register(Pembayaran)
class PembayaranAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'metode', 'get_gross_amount_formatted', 'is_lunas', 'status_transaksi', 'bukti_bayar_preview', 'tanggal_konfirmasi')
    list_filter = ('metode', 'is_lunas', 'status_transaksi', 'tanggal_konfirmasi')
    search_fields = ('order_id', 'transaction_id', 'midtrans_order_id')
    readonly_fields = ('bukti_bayar_large_preview', 'tanggal_konfirmasi', 'snap_token', 'midtrans_order_id', 'transaction_id')
    actions = ['konfirmasi_pembayaran', 'batal_konfirmasi_pembayaran']

    def get_gross_amount_formatted(self, obj):
        return f"Rp {int(obj.gross_amount):,}".replace(",", ".")
    get_gross_amount_formatted.short_description = 'Total Bayar'

    def bukti_bayar_preview(self, obj):
        if obj.bukti_bayar:
            return format_html('<a href="{0}" target="_blank"><img src="{0}" width="50" height="50" style="object-fit: cover; border-radius: 4px; border: 1px solid #ccc;" /></a>', obj.bukti_bayar.url)
        return "-"
    bukti_bayar_preview.short_description = 'Bukti Bayar'

    def bukti_bayar_large_preview(self, obj):
        if obj.bukti_bayar:
            return format_html('<a href="{0}" target="_blank"><img src="{0}" style="max-width: 400px; max-height: 400px; border-radius: 8px; border: 1px solid #ddd;" /></a><br/><small>Klik gambar untuk melihat ukuran penuh</small>', obj.bukti_bayar.url)
        return "Belum ada bukti pembayaran."
    bukti_bayar_large_preview.short_description = 'Preview Bukti Bayar'

    def konfirmasi_pembayaran(self, request, queryset):
        rows_updated = 0
        for pembayaran in queryset:
            pembayaran.is_lunas = True
            pembayaran.status_transaksi = 'settlement'
            pembayaran.tanggal_konfirmasi = timezone.now()
            pembayaran.save()
            
            # Update order status
            try:
                order = Order.objects.get(id=pembayaran.order_id)
                order.status = 'diproses'
                order.save()
            except Order.DoesNotExist:
                pass
            rows_updated += 1
        
        self.message_user(request, f"{rows_updated} pembayaran berhasil dikonfirmasi.")
    konfirmasi_pembayaran.short_description = "Konfirmasi Pembayaran (Set Lunas)"

    def batal_konfirmasi_pembayaran(self, request, queryset):
        rows_updated = 0
        for pembayaran in queryset:
            pembayaran.is_lunas = False
            pembayaran.status_transaksi = 'pending'
            pembayaran.tanggal_konfirmasi = None
            pembayaran.save()
            
            # Update order status
            try:
                order = Order.objects.get(id=pembayaran.order_id)
                order.status = 'pending'
                order.save()
            except Order.DoesNotExist:
                pass
            rows_updated += 1
        
        self.message_user(request, f"{rows_updated} pembayaran dibatalkan konfirmasinya.")
    batal_konfirmasi_pembayaran.short_description = "Batalkan Konfirmasi Pembayaran (Set Belum Lunas)"

    def save_model(self, request, obj, form, change):
        # Update order status accordingly when saving
        super().save_model(request, obj, form, change)
        try:
            order = Order.objects.get(id=obj.order_id)
            if obj.is_lunas:
                obj.status_transaksi = 'settlement'
                if not obj.tanggal_konfirmasi:
                    obj.tanggal_konfirmasi = timezone.now()
                obj.save(update_fields=['status_transaksi', 'tanggal_konfirmasi'])
                order.status = 'diproses'
            else:
                obj.status_transaksi = 'pending'
                obj.tanggal_konfirmasi = None
                obj.save(update_fields=['status_transaksi', 'tanggal_konfirmasi'])
                order.status = 'pending'
            order.save()
        except Order.DoesNotExist:
            pass
