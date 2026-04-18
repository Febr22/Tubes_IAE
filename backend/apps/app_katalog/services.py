from .models import Product

def get_all_products():
    return Product.objects.all()
    # ambil semua data produk dari database