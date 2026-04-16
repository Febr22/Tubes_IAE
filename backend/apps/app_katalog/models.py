# Create your models here.
from django.db import models

class Laptop(models.Model):
    
    nama_laptop = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    harga = models.DecimalField(max_digits=12, decimal_places=2)
    stok = models.IntegerField(default=0)
    spesifikasi = models.JSONField(help_text="Contoh: {'RAM': '16GB', 'CPU': 'Intel i7'}", blank=True, null=True)
    tanggal_ditambahkan = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'tabel_laptop' # Nama tabel di phpMyAdmin
        verbose_name = 'Katalog Laptop'

    def __str__(self):
        return f"{self.brand} {self.nama_laptop}"