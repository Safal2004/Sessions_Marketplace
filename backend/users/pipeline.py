import os
from urllib.parse import urlencode
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken

def save_avatar(strategy, details, response, backend, user=None, *args, **kwargs):
    """
    Custom pipeline step to save user avatar URL and provider details 
    from GitHub OAuth response into our custom User model.
    """
    if user:
        changed = False
        
        # Save avatar URL if not already set
        avatar_url = response.get('avatar_url')
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
            changed = True
            
        # Save OAuth provider type ('github')
        backend_name = backend.name
        if backend_name and not user.provider:
            user.provider = backend_name
            changed = True
            
        # Save unique provider user ID
        provider_id = response.get('id')
        if provider_id and not user.provider_id:
            user.provider_id = str(provider_id)
            changed = True
            
        if changed:
            user.save()


def issue_jwt(strategy, details, backend, user=None, *args, **kwargs):
    """
    Custom pipeline step that intercepts successful authentication,
    generates SimpleJWT Access and Refresh tokens with custom claims (role),
    and redirects the user directly back to the Next.js frontend with tokens.
    """
    if not user:
        return

    # Generate SimpleJWT tokens
    refresh = RefreshToken.for_user(user)
    
    # Inject user's custom role into token payloads
    refresh['role'] = user.role
    access_token = refresh.access_token
    access_token['role'] = user.role

    # Fetch frontend callback URL from Django settings or environment (fallback to localhost:3000)
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    callback_url = f"{frontend_url.rstrip('/')}/auth/callback"

    # Build query string with token payloads
    query_params = {
        'access': str(access_token),
        'refresh': str(refresh)
    }
    
    # Redirect user directly to frontend callback page
    redirect_url = f"{callback_url}?{urlencode(query_params)}"
    return redirect(redirect_url)
