from django.db import models

# Create your models here.
from django.db import models

class Laptop(models.Model):
    # Hanya menyimpan ID Penjual (dari db_utama), BUKAN ForeignKey
    penjual_id = models.IntegerField(help_text="ID Penjual dari tabel app_users")
    
    nama_laptop = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    
    # max_digits=12 berarti bisa menyimpan harga sampai ratusan miliar
    harga = models.DecimalField(max_digits=12, decimal_places=2)
    stok = models.IntegerField(default=0)
    
    # JSONField sangat cocok untuk spesifikasi yang formatnya sering berubah-ubah
    spesifikasi = models.JSONField(help_text="Contoh: {'RAM': '16GB', 'CPU': 'Intel i7'}", blank=True, null=True)
    
    tanggal_ditambahkan = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tabel_laptop' # Nama tabel di phpMyAdmin
        verbose_name = 'Katalog Laptop'

    def __str__(self):
        return f"{self.brand} {self.nama_laptop}"