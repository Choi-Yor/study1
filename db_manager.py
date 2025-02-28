import os
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime, Text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# SQLAlchemy setup
Base = declarative_base()

class Todo(Base):
    __tablename__ = 'todos'
    
    id = Column(Integer, primary_key=True)
    task = Column(Text, nullable=False)
    due_date = Column(Date)
    priority = Column(String)
    status = Column(String)
    created_at = Column(DateTime)

class Note(Base):
    __tablename__ = 'notes'
    
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime)

class TodoDB:
    def __init__(self):
        # PostgreSQL connection string from .env
        db_host = os.getenv('DB_HOST')
        db_port = os.getenv('DB_PORT')
        db_username = os.getenv('DB_USERNAME')
        db_password = os.getenv('DB_PASSWORD')
        db_name = os.getenv('DB_NAME')
        
        # Create SQLAlchemy engine for the database
        self.engine = create_engine(
            f'postgresql://{db_username}:{db_password}@{db_host}:{db_port}/{db_name}'
        )
        
        # Create tables if not exist
        Base.metadata.create_all(self.engine)
        
        # Create session
        self.Session = sessionmaker(bind=self.engine)

    def add_todo(self, task, due_date, priority):
        session = self.Session()
        new_todo = Todo(
            task=task, 
            due_date=datetime.strptime(due_date, "%Y-%m-%d").date(), 
            priority=priority, 
            status='Pending', 
            created_at=datetime.now()
        )
        session.add(new_todo)
        session.commit()
        session.close()

    def get_todos(self):
        session = self.Session()
        todos = session.query(Todo).all()
        df = pd.DataFrame([
            {
                'id': todo.id, 
                'task': todo.task, 
                'due_date': todo.due_date, 
                'priority': todo.priority, 
                'status': todo.status, 
                'created_at': todo.created_at
            } for todo in todos
        ])
        session.close()
        return df

    def update_status(self, todo_id, new_status):
        session = self.Session()
        todo = session.query(Todo).filter(Todo.id == todo_id).first()
        if todo:
            todo.status = new_status
            session.commit()
        session.close()

    def delete_todo(self, todo_id):
        session = self.Session()
        todo = session.query(Todo).filter(Todo.id == todo_id).first()
        if todo:
            session.delete(todo)
            session.commit()
        session.close()

    def add_note(self, content):
        session = self.Session()
        new_note = Note(
            content=content, 
            created_at=datetime.now()
        )
        session.add(new_note)
        session.commit()
        session.close()

    def get_notes(self):
        session = self.Session()
        notes = session.query(Note).all()
        df = pd.DataFrame([
            {
                'id': note.id, 
                'content': note.content, 
                'created_at': note.created_at
            } for note in notes
        ])
        session.close()
        return df

    def update_note(self, note_id, new_content):
        session = self.Session()
        note = session.query(Note).filter(Note.id == note_id).first()
        if note:
            note.content = new_content
            session.commit()
        session.close()

    def delete_note(self, note_id):
        session = self.Session()
        note = session.query(Note).filter(Note.id == note_id).first()
        if note:
            session.delete(note)
            session.commit()
        session.close()
