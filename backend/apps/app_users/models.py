from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings # <-- Wajib di-import untuk settings.AUTH_USER_MODEL

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Pelanggan'),
        ('admin', 'Admin Toko'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    no_telepon = models.CharField(max_length=15, blank=True, null=True)
    alamat_utama = models.TextField(blank=True, null=True) # Tetap dipertahankan untuk kompatibilitas data lama
    foto_profil = models.ImageField(upload_to='avatars/', null=True, blank=True)

    # Karena kita mengganti default User Django, kita harus memberitahu bahwa email adalah username-nya
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'tabel_pengguna' # Nama tabel yang akan muncul di phpMyAdmin
        verbose_name = 'Pengguna'
        verbose_name_plural = 'Daftar Pengguna'

    def __str__(self):
        return self.email


class Alamat(models.Model): # <-- Sekarang kedudukannya sudah sejajar, tidak masuk di dalam CustomUser
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='daftar_alamat'
    )
    nama_penerima = models.CharField(max_length=100) # Perbaikan dari max_wlength
    no_telepon = models.CharField(max_length=20)
    alamat_lengkap = models.TextField()
    kota_kabupaten = models.CharField(max_length=100)
    provinsi = models.CharField(max_length=100)
    kode_pos = models.CharField(max_length=10)
    is_utama = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Daftar Alamat"
        ordering = ['-is_utama', '-created_at'] # Alamat utama akan selalu muncul paling atas

    def __str__(self):
        return f"Alamat {self.nama_penerima} - {self.kota_kabupaten}"

    def save(self, *args, **kwargs):
        # Logika Shopee: Jika alamat ini disimpan sebagai UTAMA, 
        # matikan status utama pada alamat-alamat milik user ini yang lain.
        if self.is_utama:
            Alamat.objects.filter(user=self.user).exclude(pk=self.pk).update(is_utama=False)
        
        # Jika ini adalah alamat pertama milik user, otomatis set menjadi Utama
        elif not Alamat.objects.filter(user=self.user).exists():
            self.is_utama = True
            
        super().save(*args, **kwargs)