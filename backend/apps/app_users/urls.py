from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserDetailView

urlpatterns = [
    # Login (Dapatkan Token)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Register
    path('register/', RegisterView.as_view(), name='register'),
    
    # Profile (Cek User yang sedang login)
    path('me/', UserDetailView.as_view(), name='user_detail'),
]