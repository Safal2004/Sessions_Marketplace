from rest_framework import viewsets, filters, permissions
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Session
from .serializers import (
    SessionListSerializer,
    SessionDetailSerializer,
    SessionCreateUpdateSerializer
)
from .permissions import IsCreatorRole, IsOwnerOrReadOnly

class StandardResultsSetPagination(PageNumberPagination):
    """
    Pagination class defining the default listing pages and query sizing.
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 100


class SessionViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet to handle listing, retrieving, creating, updating, 
    and deleting Sessions with role-based checks and SQL query optimization.
    """
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # select_related avoids N+1 query loops when fetching nested creator profile details
        queryset = Session.objects.select_related('creator').all()
        user = self.request.user

        # 1. Access Control Logic in Queryset:
        # Public users see only published sessions. Logged-in users see all published sessions
        # PLUS their own created sessions (published or unpublished).
        if user and user.is_authenticated:
            queryset = queryset.filter(Q(is_published=True) | Q(creator=user))
        else:
            queryset = queryset.filter(is_published=True)

        # 2. Dynamic query parameter filters:
        
        # Filter by creator ID (?creator=<uuid>)
        creator_id = self.request.query_params.get('creator')
        if creator_id:
            queryset = queryset.filter(creator_id=creator_id)

        # Filter by publication status (?published=true/false)
        published = self.request.query_params.get('published')
        if published is not None:
            is_pub = published.lower() == 'true'
            if is_pub:
                queryset = queryset.filter(is_published=True)
            else:
                # Restrict unpublished visibility to the creator only
                if user and user.is_authenticated:
                    queryset = queryset.filter(is_published=False, creator=user)
                else:
                    queryset = queryset.none()

        return queryset

    def get_serializer_class(self):
        """
        Dynamically return specific serialization schemas based on action types.
        """
        if self.action == 'list':
            return SessionListSerializer
        elif self.action == 'retrieve':
            return SessionDetailSerializer
        return SessionCreateUpdateSerializer

    def get_permissions(self):
        """
        Enforce strict contextual security based on the requested API action.
        """
        if self.action in ['create']:
            # Only authenticated users with the 'creator' role can create sessions
            return [permissions.IsAuthenticated(), IsCreatorRole()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only the owner who created the session can edit or delete it
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        # Allow open/public read access to list and retrieve published profiles
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Auto-assign the requesting user as the creator of this session
        serializer.save(creator=self.request.user)
