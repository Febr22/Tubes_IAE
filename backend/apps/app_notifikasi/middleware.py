from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query = parse_qs(scope["query_string"].decode())
        token = query.get("token", [None])[0]

        scope["user"] = AnonymousUser()
        if token:
            try:
                validated = UntypedToken(token)
                user_id = validated.payload.get("user_id")
                if user_id:
                    scope["user"] = await get_user(user_id)
            except (InvalidToken, TokenError):
                pass

        return await super().__call__(scope, receive, send)