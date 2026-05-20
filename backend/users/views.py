from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
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

class CompleteOnboardingView(APIView):
    """
    Endpoint that handles first-time user onboarding role selection.
    Validates selected role and marks has_completed_onboarding as True.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        if role not in ['creator', 'attendee', 'user']:
            return Response(
                {"error": "Invalid role option selected. Must be 'creator' or 'attendee'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Map incoming 'attendee' selection to internal DB value 'user'
        db_role = 'user' if role == 'attendee' else role
        
        user = request.user
        user.role = db_role
        user.has_completed_onboarding = True
        user.save()
        
        # Return updated serialized user payload
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
