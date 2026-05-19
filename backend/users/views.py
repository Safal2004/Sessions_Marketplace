from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

class MeView(APIView):
    """
    Endpoint that returns the currently authenticated user's profile.
    Requires a valid JWT Bearer access token in the Authorization header.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
