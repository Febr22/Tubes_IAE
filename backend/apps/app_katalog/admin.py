from django.contrib import admin
from .models import Produk, Kategori

# Agar tampilan kategori lebih rapi
@admin.register(Kategori)
class KategoriAdmin(admin.ModelAdmin):
    list_display = ('id', 'nama', 'slug')
    search_fields = ('nama',)
    prepopulated_fields = {'slug': ('nama',)}

# Agar tampilan produk lebih informatif (tidak cuma list nama)
@admin.register(Produk)
class ProdukAdmin(admin.ModelAdmin):
    list_display = ('nama', 'kategori', 'harga', 'stok', 'is_available')
    list_filter = ('kategori', 'is_available', 'created_at')
    list_editable = ('harga', 'stok', 'is_available') # Bisa edit harga langsung tanpa buka detail
    search_fields = ('nama', 'deskripsi')
    prepopulated_fields = {'slug': ('nama',)}
    
    # Memberi warna/style pada kolom is_available
    list_per_page = 20