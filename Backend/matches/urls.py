from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet

router = DefaultRouter()
router.register('', MatchViewSet, basename='match')

urlpatterns = [
    path('', include(router.urls)),
]