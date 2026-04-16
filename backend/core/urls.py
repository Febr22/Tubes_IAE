from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.app_users.urls')),
    
    # Beri tanda pagar (#) di depan baris ini untuk sementara
    # path('api/katalog/', include('apps.app_katalog.urls')), 
]