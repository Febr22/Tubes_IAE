from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserDetailView, AlamatViewSet

# Buat router untuk meng-handle ViewSet secara otomatis
router = DefaultRouter()
router.register(r'alamat', AlamatViewSet, basename='alamat')

urlpatterns = [
    # Login (Dapatkan Token)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Register
    path('register/', RegisterView.as_view(), name='register'),
    
    # Profile (Cek User yang sedang login)
    path('me/', UserDetailView.as_view(), name='user_detail'),

    # Endpoint Alamat (Otomatis generate GET, POST, PATCH, DELETE)
    path('', include(router.urls)),
]