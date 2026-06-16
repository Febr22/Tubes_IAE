from django.db import models
from django.utils.text import slugify

class Kategori(models.Model):
    nama = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.nama

    class Meta:
        verbose_name_plural = "Kategori"

class Produk(models.Model):
    kategori = models.ForeignKey(Kategori, on_delete=models.CASCADE, related_name='produk')
    nama = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    deskripsi = models.TextField(blank=True)
    
    # Harga menggunakan DecimalField untuk akurasi uang
    harga = models.DecimalField(max_digits=12, decimal_places=2)
    stok = models.PositiveIntegerField(default=0)
    
    # ImageField membutuhkan library 'Pillow' (pip install Pillow)
    gambar = models.ImageField(upload_to='katalog/produk/', null=True, blank=True)
    
    # Spesifikasi teknis tambahan 
    prosesor = models.CharField(max_length=100, blank=True)
    ram = models.CharField(max_length=50, blank=True)
    storage = models.CharField(max_length=50, blank=True)
    
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.nama)
            slug = base_slug
            counter = 1
            while Produk.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nama

    class Meta:
        verbose_name_plural = "Produk"
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