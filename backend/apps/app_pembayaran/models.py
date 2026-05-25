from django.db import models

class Pembayaran(models.Model):
    METODE_CHOICES = (
        ('midtrans', 'Midtrans Snap'),
        ('transfer', 'Transfer Bank Manual'),
        ('qris', 'QRIS'),
        ('cc', 'Kartu Kredit'),
    )
    
    order_id = models.IntegerField(unique=True) # ID dari db_ms_pesanan
    metode = models.CharField(max_length=50, choices=METODE_CHOICES, default='midtrans')
    bukti_bayar = models.ImageField(upload_to='pembayaran/', blank=True, null=True)
    is_lunas = models.BooleanField(default=False)
    tanggal_konfirmasi = models.DateTimeField(blank=True, null=True)
    
    # --- Field Tambahan untuk Midtrans ---
    midtrans_order_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    snap_token = models.CharField(max_length=255, blank=True, null=True)
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status_transaksi = models.CharField(max_length=50, default='pending') # pending, settlement, cancel, expire, deny
    metode_pembayaran_midtrans = models.CharField(max_length=100, blank=True, null=True) # e.g. gopay, bank_transfer
    waktu_transaksi = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'tabel_pembayaran'

    def __str__(self):
        return f"Pembayaran Order #{self.order_id} - {self.status_transaksi} (Lunas: {self.is_lunas})"