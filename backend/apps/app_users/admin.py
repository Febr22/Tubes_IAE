from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Alamat # <-- Import model Alamat yang baru

# Membuat baris alamat terintegrasi di dalam halaman detail User
class AlamatInline(admin.TabularInline):
    model = Alamat
    extra = 1 # Jumlah form kosong yang otomatis muncul untuk menambah alamat baru
    fields = ('nama_penerima', 'no_telepon', 'alamat_lengkap', 'kota_kabupaten', 'is_utama')


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'no_telepon', 'alamat_utama', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informasi E-Commerce', {'fields': ('role', 'no_telepon', 'alamat_utama')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informasi E-Commerce', {'fields': ('role', 'no_telepon', 'alamat_utama')}),
    )
    
    # Memasukkan inline alamat ke dalam halaman UserAdmin
    inlines = [AlamatInline]


# Mendaftarkan Alamat sebagai menu mandiri di Jazzmin Admin
@admin.register(Alamat)
class AlamatAdmin(admin.ModelAdmin):
    list_display = ('user', 'nama_penerima', 'no_telepon', 'kota_kabupaten', 'is_utama')
    list_filter = ('is_utama', 'provinsi', 'kota_kabupaten')
    search_fields = ('nama_penerima', 'alamat_lengkap', 'user__email', 'user__username')