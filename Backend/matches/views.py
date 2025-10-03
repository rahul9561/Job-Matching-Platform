from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from .models import Match
from .serializers import MatchSerializer

class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'candidate':
            return Match.objects.filter(candidate=user)
        elif user.user_type == 'recruiter':
            return Match.objects.filter(job__recruiter=user)
        
        return Match.objects.none()
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get match statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_matches': queryset.count(),
            'avg_match_score': queryset.aggregate(Avg('match_score'))['match_score__avg'] or 0,
            'status_breakdown': queryset.values('status').annotate(count=Count('id')),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update match status"""
        ids = request.data.get('ids', [])
        new_status = request.data.get('status')
        
        if not ids or not new_status:
            return Response(
                {'error': 'ids and status are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(id__in=ids)
        updated = queryset.update(status=new_status)
        
        return Response({
            'updated': updated,
            'status': new_status
        })