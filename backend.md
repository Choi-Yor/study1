# Django 백엔드 개발 계획 및 API 명세서

## 1. 현재 애플리케이션 분석

현재 애플리케이션은 다음과 같은 기능을 가진 Streamlit 기반 Todo List & Notes 애플리케이션입니다:

### Todo List 기능:
- 할 일 추가 (작업, 마감일, 우선순위)
- 할 일 목록 조회
- 상태 필터링 (전체/진행 중/완료)
- 할 일 상태 변경 (완료/취소)
- 할 일 삭제
- 통계 표시 (총 할 일, 완료된 할 일, 완료율)

### Notes 기능:
- 노트 추가 (마크다운 형식 지원)
- 노트 목록 조회
- 노트 수정
- 노트 삭제

### 데이터베이스 구조:
- PostgreSQL 데이터베이스 사용
- Todo 모델: id, task, due_date, priority, status, created_at
- Note 모델: id, content, created_at

## 2. Django 백엔드 개발 계획

### 2.1 프로젝트 설정

```
todo_api/
├── manage.py
├── todo_api/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── api/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
└── requirements.txt
```

### 2.2 모델 설계

```python
# api/models.py
from django.db import models

class Todo(models.Model):
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
    ]
    
    task = models.TextField(null=False, blank=False)
    due_date = models.DateField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.task

class Note(models.Model):
    content = models.TextField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Note {self.id}"
```

### 2.3 시리얼라이저 설계

```python
# api/serializers.py
from rest_framework import serializers
from .models import Todo, Note

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'task', 'due_date', 'priority', 'status', 'created_at']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'content', 'created_at']
```

### 2.4 뷰 설계

```python
# api/views.py
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Todo, Note
from .serializers import TodoSerializer, NoteSerializer

class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority']
    search_fields = ['task']
    ordering_fields = ['due_date', 'priority', 'created_at']

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['content']
    ordering_fields = ['created_at']
```

### 2.5 URL 설계

```python
# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, NoteViewSet

router = DefaultRouter()
router.register(r'todos', TodoViewSet)
router.register(r'notes', NoteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

# todo_api/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

### 2.6 필요한 패키지

```
# requirements.txt
Django==4.2.7
djangorestframework==3.14.0
django-filter==23.3
django-cors-headers==4.3.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

## 3. API 명세서

### 3.1 Todo API

#### 3.1.1 Todo 목록 조회
- **URL**: `/api/todos/`
- **Method**: `GET`
- **URL 파라미터**:
  - `status`: 상태 필터링 (예: `?status=Pending`)
  - `priority`: 우선순위 필터링 (예: `?priority=High`)
  - `search`: 작업 내용 검색 (예: `?search=회의`)
  - `ordering`: 정렬 (예: `?ordering=due_date`, `-due_date`는 내림차순)
- **응답**: 할 일 목록 배열
```json
[
  {
    "id": 1,
    "task": "보고서 작성",
    "due_date": "2025-03-05",
    "priority": "High",
    "status": "Pending",
    "created_at": "2025-02-28T08:30:00Z"
  },
  ...
]
```

#### 3.1.2 Todo 상세 조회
- **URL**: `/api/todos/{id}/`
- **Method**: `GET`
- **URL 파라미터**: 없음
- **응답**: 할 일 상세 정보
```json
{
  "id": 1,
  "task": "보고서 작성",
  "due_date": "2025-03-05",
  "priority": "High",
  "status": "Pending",
  "created_at": "2025-02-28T08:30:00Z"
}
```

#### 3.1.3 Todo 생성
- **URL**: `/api/todos/`
- **Method**: `POST`
- **데이터 파라미터**:
```json
{
  "task": "보고서 작성",
  "due_date": "2025-03-05",
  "priority": "High"
}
```
- **응답**: 생성된 할 일 정보
```json
{
  "id": 1,
  "task": "보고서 작성",
  "due_date": "2025-03-05",
  "priority": "High",
  "status": "Pending",
  "created_at": "2025-02-28T08:30:00Z"
}
```

#### 3.1.4 Todo 수정
- **URL**: `/api/todos/{id}/`
- **Method**: `PUT` 또는 `PATCH`
- **데이터 파라미터** (PATCH의 경우 일부만 포함 가능):
```json
{
  "task": "보고서 작성 및 검토",
  "due_date": "2025-03-10",
  "priority": "Medium",
  "status": "Completed"
}
```
- **응답**: 수정된 할 일 정보
```json
{
  "id": 1,
  "task": "보고서 작성 및 검토",
  "due_date": "2025-03-10",
  "priority": "Medium",
  "status": "Completed",
  "created_at": "2025-02-28T08:30:00Z"
}
```

#### 3.1.5 Todo 삭제
- **URL**: `/api/todos/{id}/`
- **Method**: `DELETE`
- **URL 파라미터**: 없음
- **응답**: 204 No Content

### 3.2 Note API

#### 3.2.1 Note 목록 조회
- **URL**: `/api/notes/`
- **Method**: `GET`
- **URL 파라미터**:
  - `search`: 내용 검색 (예: `?search=회의`)
  - `ordering`: 정렬 (예: `?ordering=created_at`, `-created_at`는 내림차순)
- **응답**: 노트 목록 배열
```json
[
  {
    "id": 1,
    "content": "# 회의 내용\n- 프로젝트 일정 논의\n- 담당자 배정",
    "created_at": "2025-02-28T09:00:00Z"
  },
  ...
]
```

#### 3.2.2 Note 상세 조회
- **URL**: `/api/notes/{id}/`
- **Method**: `GET`
- **URL 파라미터**: 없음
- **응답**: 노트 상세 정보
```json
{
  "id": 1,
  "content": "# 회의 내용\n- 프로젝트 일정 논의\n- 담당자 배정",
  "created_at": "2025-02-28T09:00:00Z"
}
```

#### 3.2.3 Note 생성
- **URL**: `/api/notes/`
- **Method**: `POST`
- **데이터 파라미터**:
```json
{
  "content": "# 회의 내용\n- 프로젝트 일정 논의\n- 담당자 배정"
}
```
- **응답**: 생성된 노트 정보
```json
{
  "id": 1,
  "content": "# 회의 내용\n- 프로젝트 일정 논의\n- 담당자 배정",
  "created_at": "2025-02-28T09:00:00Z"
}
```

#### 3.2.4 Note 수정
- **URL**: `/api/notes/{id}/`
- **Method**: `PUT` 또는 `PATCH`
- **데이터 파라미터**:
```json
{
  "content": "# 회의 내용 수정\n- 프로젝트 일정 논의\n- 담당자 배정\n- 예산 검토"
}
```
- **응답**: 수정된 노트 정보
```json
{
  "id": 1,
  "content": "# 회의 내용 수정\n- 프로젝트 일정 논의\n- 담당자 배정\n- 예산 검토",
  "created_at": "2025-02-28T09:00:00Z"
}
```

#### 3.2.5 Note 삭제
- **URL**: `/api/notes/{id}/`
- **Method**: `DELETE`
- **URL 파라미터**: 없음
- **응답**: 204 No Content

## 4. 구현 단계

1. Django 프로젝트 및 앱 생성
2. 데이터베이스 설정 (PostgreSQL)
3. 모델 구현
4. 시리얼라이저 구현
5. 뷰셋 구현
6. URL 라우팅 설정
7. CORS 설정 (Next.js 프론트엔드와의 통신을 위해)
8. 테스트 코드 작성
9. API 문서화 (Swagger/OpenAPI)

## 5. 보안 고려사항

1. 환경 변수를 통한 민감한 정보 관리 (데이터베이스 자격 증명 등)
2. CORS 설정을 통한 허용된 도메인만 접근 가능하도록 제한
3. 필요한 경우 JWT 기반 인증 시스템 구현 (사용자별 할 일 관리 기능 추가 시)

## 6. 확장 가능성

1. 사용자 인증 및 권한 관리 시스템 추가
2. 할 일 카테고리 기능 추가
3. 할 일 알림 기능 추가
4. 할 일 공유 기능 추가
5. 통계 API 추가 (완료율, 우선순위별 분포 등)
