"""
ASGI config for core project — with WebSocket support via Django Channels.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.app_notifikasi.middleware import JWTAuthMiddleware
import apps.app_notifikasi.routing as notif_routing

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(notif_routing.websocket_urlpatterns)
    ),
})