from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Todo, Note
import json
from datetime import date

class TodoAPITest(TestCase):
    """Todo API 테스트 클래스"""
    
    def setUp(self):
        """테스트 데이터 설정"""
        self.client = APIClient()
        self.todo_data = {
            'task': '테스트 할 일',
            'due_date': '2025-03-10',
            'priority': 'High',
            'status': 'Pending'
        }
        self.todo = Todo.objects.create(
            task='기존 할 일',
            due_date='2025-03-15',
            priority='Medium',
            status='Pending'
        )
        self.todos_url = reverse('todo-list')
        self.todo_detail_url = reverse('todo-detail', kwargs={'pk': self.todo.pk})
    
    def test_create_todo(self):
        """할 일 생성 테스트"""
        response = self.client.post(
            self.todos_url,
            data=json.dumps(self.todo_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Todo.objects.count(), 2)
        self.assertEqual(Todo.objects.get(task='테스트 할 일').priority, 'High')
    
    def test_get_all_todos(self):
        """할 일 목록 조회 테스트"""
        response = self.client.get(self.todos_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_single_todo(self):
        """단일 할 일 조회 테스트"""
        response = self.client.get(self.todo_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['task'], '기존 할 일')
    
    def test_update_todo(self):
        """할 일 수정 테스트"""
        updated_data = {
            'task': '수정된 할 일',
            'due_date': '2025-03-20',
            'priority': 'Low',
            'status': 'Completed'
        }
        response = self.client.put(
            self.todo_detail_url,
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Todo.objects.get(pk=self.todo.pk).task, '수정된 할 일')
        self.assertEqual(Todo.objects.get(pk=self.todo.pk).status, 'Completed')
    
    def test_partial_update_todo(self):
        """할 일 부분 수정 테스트"""
        partial_data = {'status': 'Completed'}
        response = self.client.patch(
            self.todo_detail_url,
            data=json.dumps(partial_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Todo.objects.get(pk=self.todo.pk).status, 'Completed')
        self.assertEqual(Todo.objects.get(pk=self.todo.pk).task, '기존 할 일')  # 변경되지 않은 필드
    
    def test_delete_todo(self):
        """할 일 삭제 테스트"""
        response = self.client.delete(self.todo_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Todo.objects.count(), 0)
    
    def test_filter_todos(self):
        """할 일 필터링 테스트"""
        # 추가 데이터 생성
        Todo.objects.create(
            task='중요한 할 일',
            due_date='2025-03-25',
            priority='High',
            status='Pending'
        )
        Todo.objects.create(
            task='완료된 할 일',
            due_date='2025-03-05',
            priority='Low',
            status='Completed'
        )
        
        # 상태로 필터링
        response = self.client.get(f"{self.todos_url}?status=Completed")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['task'], '완료된 할 일')
        
        # 우선순위로 필터링
        response = self.client.get(f"{self.todos_url}?priority=High")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['task'], '중요한 할 일')
        
        # 검색 기능 테스트
        response = self.client.get(f"{self.todos_url}?search=중요한")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['task'], '중요한 할 일')

class NoteAPITest(TestCase):
    """Note API 테스트 클래스"""
    
    def setUp(self):
        """테스트 데이터 설정"""
        self.client = APIClient()
        self.note_data = {
            'content': '테스트 노트 내용'
        }
        self.note = Note.objects.create(
            content='기존 노트 내용'
        )
        self.notes_url = reverse('note-list')
        self.note_detail_url = reverse('note-detail', kwargs={'pk': self.note.pk})
    
    def test_create_note(self):
        """노트 생성 테스트"""
        response = self.client.post(
            self.notes_url,
            data=json.dumps(self.note_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.count(), 2)
        self.assertEqual(Note.objects.get(content='테스트 노트 내용').content, '테스트 노트 내용')
    
    def test_get_all_notes(self):
        """노트 목록 조회 테스트"""
        response = self.client.get(self.notes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_single_note(self):
        """단일 노트 조회 테스트"""
        response = self.client.get(self.note_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], '기존 노트 내용')
    
    def test_update_note(self):
        """노트 수정 테스트"""
        updated_data = {
            'content': '수정된 노트 내용'
        }
        response = self.client.put(
            self.note_detail_url,
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Note.objects.get(pk=self.note.pk).content, '수정된 노트 내용')
    
    def test_partial_update_note(self):
        """노트 부분 수정 테스트"""
        partial_data = {'content': '부분 수정된 노트 내용'}
        response = self.client.patch(
            self.note_detail_url,
            data=json.dumps(partial_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Note.objects.get(pk=self.note.pk).content, '부분 수정된 노트 내용')
    
    def test_delete_note(self):
        """노트 삭제 테스트"""
        response = self.client.delete(self.note_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Note.objects.count(), 0)
    
    def test_search_notes(self):
        """노트 검색 테스트"""
        # 추가 데이터 생성
        Note.objects.create(content='중요한 회의 내용')
        Note.objects.create(content='프로젝트 아이디어')
        
        # 검색 기능 테스트
        response = self.client.get(f"{self.notes_url}?search=회의")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['content'], '중요한 회의 내용')
