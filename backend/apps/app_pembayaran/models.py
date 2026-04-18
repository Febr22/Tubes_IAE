from django.db import models

class Pembayaran(models.Model):
    METODE_CHOICES = (
        ('transfer', 'Transfer Bank'),
        ('qris', 'QRIS'),
        ('cc', 'Kartu Kredit'),
    )
    
    order_id = models.IntegerField(unique=True) # ID dari db_ms_pesanan
    metode = models.CharField(max_length=20, choices=METODE_CHOICES)
    bukti_bayar = models.ImageField(upload_to='pembayaran/', blank=True, null=True)
    is_lunas = models.BooleanField(default=False)
    tanggal_konfirmasi = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'tabel_pembayaran'