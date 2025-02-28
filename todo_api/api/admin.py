from django.contrib import admin
from .models import Todo, Note

# Register your models here.

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('id', 'task', 'due_date', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('task',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'created_at')
    search_fields = ('content',)
