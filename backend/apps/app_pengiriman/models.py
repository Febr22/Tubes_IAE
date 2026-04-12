from django.db import models

class Pengiriman(models.Model):
    order_id = models.IntegerField(unique=True) # ID dari db_ms_pesanan
    kurir = models.CharField(max_length=50) # Contoh: JNE, J&T
    no_resi = models.CharField(max_length=100, blank=True, null=True)
    alamat_tujuan = models.TextField()
    status_logistik = models.CharField(max_length=50, default='Menunggu Pickup')

    class Meta:
        db_table = 'tabel_pengiriman'