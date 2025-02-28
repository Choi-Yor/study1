from rest_framework import serializers
from .models import Todo, Note
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

class TodoSerializer(serializers.ModelSerializer):
    """
    할 일(Todo) 항목을 위한 시리얼라이저
    
    필드:
    - id: 할 일 항목의 고유 식별자
    - task: 할 일 내용
    - due_date: 마감일 (YYYY-MM-DD 형식)
    - priority: 우선순위 (High, Medium, Low)
    - status: 상태 (Pending, Completed)
    - created_at: 생성일시
    """
    
    # 읽기 전용 필드 추가
    created_at = serializers.DateTimeField(read_only=True)
    
    # 선택 필드에 대한 표시 메서드
    @extend_schema_field(OpenApiTypes.STR)
    def get_priority_display(self, obj):
        return obj.get_priority_display()
    
    @extend_schema_field(OpenApiTypes.STR)
    def get_status_display(self, obj):
        return obj.get_status_display()
    
    class Meta:
        model = Todo
        fields = ['id', 'task', 'due_date', 'priority', 'status', 'created_at']
        extra_kwargs = {
            'task': {'help_text': '할 일 내용'},
            'due_date': {'help_text': '마감일 (YYYY-MM-DD)'},
            'priority': {'help_text': '우선순위 (High, Medium, Low)'},
            'status': {'help_text': '상태 (Pending, Completed)'},
        }

class NoteSerializer(serializers.ModelSerializer):
    """
    노트(Note) 항목을 위한 시리얼라이저
    
    필드:
    - id: 노트 항목의 고유 식별자
    - content: 노트 내용 (마크다운 형식 지원)
    - created_at: 생성일시
    """
    
    # 읽기 전용 필드 추가
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Note
        fields = ['id', 'content', 'created_at']
        extra_kwargs = {
            'content': {'help_text': '노트 내용'},
        }
