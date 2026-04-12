from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Pembeli'),
        ('seller', 'Penjual'),
        ('admin', 'Admin'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    no_telepon = models.CharField(max_length=15, blank=True, null=True)
    alamat_utama = models.TextField(blank=True, null=True)

    # Karena kita mengganti default User Django, kita harus memberitahu bahwa email adalah username-nya
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'tabel_pengguna' # Nama tabel yang akan muncul di phpMyAdmin
        verbose_name = 'Pengguna'

    def __str__(self):
        return self.email