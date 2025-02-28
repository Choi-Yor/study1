from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Todo, Note
from .serializers import TodoSerializer, NoteSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

@extend_schema_view(
    list=extend_schema(
        summary="할 일 목록 조회",
        description="모든 할 일 항목을 조회합니다. 상태, 우선순위로 필터링하거나 내용으로 검색할 수 있습니다.",
        parameters=[
            OpenApiParameter(name="status", description="상태 필터링 (Pending/Completed)", type=OpenApiTypes.STR),
            OpenApiParameter(name="priority", description="우선순위 필터링 (High/Medium/Low)", type=OpenApiTypes.STR),
            OpenApiParameter(name="search", description="할 일 내용 검색", type=OpenApiTypes.STR),
            OpenApiParameter(name="ordering", description="정렬 기준 (due_date, priority, created_at)", type=OpenApiTypes.STR),
        ]
    ),
    create=extend_schema(
        summary="할 일 생성",
        description="새로운 할 일 항목을 생성합니다."
    ),
    retrieve=extend_schema(
        summary="할 일 상세 조회",
        description="특정 할 일 항목의 상세 정보를 조회합니다."
    ),
    update=extend_schema(
        summary="할 일 수정",
        description="특정 할 일 항목을 완전히 수정합니다."
    ),
    partial_update=extend_schema(
        summary="할 일 부분 수정",
        description="특정 할 일 항목을 부분적으로 수정합니다."
    ),
    destroy=extend_schema(
        summary="할 일 삭제",
        description="특정 할 일 항목을 삭제합니다."
    )
)
class TodoViewSet(viewsets.ModelViewSet):
    """
    할 일(Todo) 항목을 관리하기 위한 API 뷰셋
    
    list:
        모든 할 일 항목을 조회합니다.
        
        - status, priority로 필터링 가능
        - task 내용으로 검색 가능
        - due_date, priority, created_at으로 정렬 가능
        
    create:
        새로운 할 일 항목을 생성합니다.
        
    retrieve:
        특정 할 일 항목의 상세 정보를 조회합니다.
        
    update:
        특정 할 일 항목을 완전히 수정합니다.
        
    partial_update:
        특정 할 일 항목을 부분적으로 수정합니다.
        
    destroy:
        특정 할 일 항목을 삭제합니다.
    """
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority']
    search_fields = ['task']
    ordering_fields = ['due_date', 'priority', 'created_at']

@extend_schema_view(
    list=extend_schema(
        summary="노트 목록 조회",
        description="모든 노트 항목을 조회합니다. 내용으로 검색할 수 있습니다.",
        parameters=[
            OpenApiParameter(name="search", description="노트 내용 검색", type=OpenApiTypes.STR),
            OpenApiParameter(name="ordering", description="정렬 기준 (created_at)", type=OpenApiTypes.STR),
        ]
    ),
    create=extend_schema(
        summary="노트 생성",
        description="새로운 노트 항목을 생성합니다."
    ),
    retrieve=extend_schema(
        summary="노트 상세 조회",
        description="특정 노트 항목의 상세 정보를 조회합니다."
    ),
    update=extend_schema(
        summary="노트 수정",
        description="특정 노트 항목을 완전히 수정합니다."
    ),
    partial_update=extend_schema(
        summary="노트 부분 수정",
        description="특정 노트 항목을 부분적으로 수정합니다."
    ),
    destroy=extend_schema(
        summary="노트 삭제",
        description="특정 노트 항목을 삭제합니다."
    )
)
class NoteViewSet(viewsets.ModelViewSet):
    """
    노트(Note) 항목을 관리하기 위한 API 뷰셋
    
    list:
        모든 노트 항목을 조회합니다.
        
        - content 내용으로 검색 가능
        - created_at으로 정렬 가능
        
    create:
        새로운 노트 항목을 생성합니다.
        
    retrieve:
        특정 노트 항목의 상세 정보를 조회합니다.
        
    update:
        특정 노트 항목을 완전히 수정합니다.
        
    partial_update:
        특정 노트 항목을 부분적으로 수정합니다.
        
    destroy:
        특정 노트 항목을 삭제합니다.
    """
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['content']
    ordering_fields = ['created_at']
