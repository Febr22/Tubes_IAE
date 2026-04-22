from django.contrib import admin
from django.contrib.auth.models import Group
from .models import Produk, Kategori

# Menghilangkan menu Group yang tidak terpakai
admin.site.unregister(Group)

# tampilan kategori 
@admin.register(Kategori)
class KategoriAdmin(admin.ModelAdmin):
    list_display = ('id', 'nama', 'slug')
    search_fields = ('nama',)
    prepopulated_fields = {'slug': ('nama',)}

# tampilan produk lebih informatif 
@admin.register(Produk)
class ProdukAdmin(admin.ModelAdmin):
    list_display = ('nama', 'kategori', 'harga', 'stok', 'is_available')
    list_filter = ('kategori', 'is_available', 'created_at')
    list_editable = ('harga', 'stok', 'is_available') 
    search_fields = ('nama', 'deskripsi')
    prepopulated_fields = {'slug': ('nama',)}
    
    # Memberi warna/style pada kolom is_available
    list_per_page = 20

