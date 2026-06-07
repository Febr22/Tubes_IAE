from django.db import models

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pesanan Dibuat'),
        ('konfirmasi', 'Menunggu Konfirmasi'),
        ('diproses', 'Laptop Disiapkan'),
        ('dikirim', 'Sedang Dikirim'),
        ('selesai', 'Laptop Diterima'),
        ('dibatalkan', 'Dibatalkan'),
    )

    pembeli_id = models.IntegerField() # Referensi ke ID User di db_utama
    total_harga = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    catatan = models.TextField(blank=True, null=True)
    tanggal_pesan = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tabel_order'

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    laptop_id = models.IntegerField() # Referensi ke ID Laptop di db_ms_katalog
    jumlah = models.IntegerField(default=1)
    harga_saat_beli = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'tabel_order_item'