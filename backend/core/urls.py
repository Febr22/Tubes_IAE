from django.contrib import admin
from django.urls import path, include
from django.conf import settings 
from django.conf.urls.static import static
from django.http import HttpResponse

urlpatterns = [
    path('', lambda request: HttpResponse("API Backend Jalan 🚀")),
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.app_users.urls')),
    path('api/katalog/', include('apps.app_katalog.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)