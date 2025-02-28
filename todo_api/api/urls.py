from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, NoteViewSet

router = DefaultRouter()
router.register(r'todos', TodoViewSet)
router.register(r'notes', NoteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
