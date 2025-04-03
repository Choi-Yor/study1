from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
from db_manager import TodoDB
from typing import List, Optional
import uvicorn

app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서는 모든 오리진 허용, 프로덕션에서는 특정 도메인으로 제한해야 함
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 초기화
db = TodoDB()

# TodoItem 모델
class TodoItem(BaseModel):
    id: Optional[int] = None
    task: str
    due_date: str
    priority: str
    status: str = "Pending"
    created_at: Optional[str] = None

# NoteItem 모델
class NoteItem(BaseModel):
    id: Optional[int] = None
    content: str
    created_at: Optional[str] = None

# Todo API 라우트
@app.get("/api/todos/")
def get_todos():
    try:
        todos_df = db.get_todos()
        if todos_df.empty:
            return []
        
        # DataFrame을 JSON으로 변환
        todos = json.loads(todos_df.to_json(orient='records', date_format='iso'))
        return todos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/todos/")
def create_todo(todo: TodoItem):
    try:
        # 저장 로직
        db.add_todo(todo.task, todo.due_date, todo.priority)
        
        # 저장 후 최신 데이터 가져오기
        todos_df = db.get_todos()
        if todos_df.empty:
            raise HTTPException(status_code=404, detail="Todo was not created properly")
        
        # 가장 최근에 추가된 항목 반환
        latest_todo = json.loads(todos_df.sort_values(by='created_at', ascending=False).head(1).to_json(orient='records', date_format='iso'))
        return latest_todo[0] if latest_todo else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/todos/{todo_id}")
def get_todo(todo_id: int):
    try:
        todos_df = db.get_todos()
        if todos_df.empty:
            raise HTTPException(status_code=404, detail="Todo not found")
        
        todo = todos_df[todos_df['id'] == todo_id]
        if todo.empty:
            raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")
        
        return json.loads(todo.to_json(orient='records', date_format='iso'))[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoItem):
    try:
        todos_df = db.get_todos()
        if todos_df.empty or todos_df[todos_df['id'] == todo_id].empty:
            raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")
        
        # 기존 todo 가져오기
        existing_todo = todos_df[todos_df['id'] == todo_id].iloc[0]
        
        # 상태 업데이트
        db.update_status(todo_id, todo.status)
        
        # 최신 데이터 반환
        updated_df = db.get_todos()
        updated_todo = updated_df[updated_df['id'] == todo_id]
        if updated_todo.empty:
            raise HTTPException(status_code=404, detail=f"Updated todo with id {todo_id} not found")
        
        return json.loads(updated_todo.to_json(orient='records', date_format='iso'))[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int):
    try:
        todos_df = db.get_todos()
        if todos_df.empty or todos_df[todos_df['id'] == todo_id].empty:
            raise HTTPException(status_code=404, detail=f"Todo with id {todo_id} not found")
        
        db.delete_todo(todo_id)
        return {"message": f"Todo with id {todo_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note API 라우트
@app.get("/api/notes/")
def get_notes():
    try:
        notes_df = db.get_notes()
        if notes_df.empty:
            return []
        
        # DataFrame을 JSON으로 변환
        notes = json.loads(notes_df.to_json(orient='records', date_format='iso'))
        print(f"Returning {len(notes)} notes")
        return notes
    except Exception as e:
        print(f"Error getting notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/notes/")
def create_note(note: NoteItem):
    try:
        print(f"Creating note with content: {note.content}")
        # 저장 로직
        db.add_note(note.content)
        
        # 저장 후 최신 데이터 가져오기
        notes_df = db.get_notes()
        if notes_df.empty:
            raise HTTPException(status_code=404, detail="Note was not created properly")
        
        # 가장 최근에 추가된 항목 반환
        latest_note = json.loads(notes_df.sort_values(by='created_at', ascending=False).head(1).to_json(orient='records', date_format='iso'))
        print(f"Note created with id: {latest_note[0]['id'] if latest_note else 'unknown'}")
        return latest_note[0] if latest_note else {}
    except Exception as e:
        print(f"Error creating note: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/notes/{note_id}")
def get_note(note_id: int):
    try:
        notes_df = db.get_notes()
        if notes_df.empty:
            raise HTTPException(status_code=404, detail="Note not found")
        
        note = notes_df[notes_df['id'] == note_id]
        if note.empty:
            raise HTTPException(status_code=404, detail=f"Note with id {note_id} not found")
        
        return json.loads(note.to_json(orient='records', date_format='iso'))[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/notes/{note_id}")
def update_note(note_id: int, note: NoteItem):
    try:
        print(f"Updating note {note_id} with content: {note.content}")
        notes_df = db.get_notes()
        if notes_df.empty or notes_df[notes_df['id'] == note_id].empty:
            raise HTTPException(status_code=404, detail=f"Note with id {note_id} not found")
        
        # 내용 업데이트
        db.update_note(note_id, note.content)
        
        # 최신 데이터 반환
        updated_df = db.get_notes()
        updated_note = updated_df[updated_df['id'] == note_id]
        if updated_note.empty:
            raise HTTPException(status_code=404, detail=f"Updated note with id {note_id} not found")
        
        result = json.loads(updated_note.to_json(orient='records', date_format='iso'))[0]
        print(f"Note updated successfully: {result}")
        return result
    except Exception as e:
        print(f"Error updating note: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/notes/{note_id}")
def delete_note(note_id: int):
    try:
        print(f"Deleting note with id: {note_id}")
        notes_df = db.get_notes()
        if notes_df.empty or notes_df[notes_df['id'] == note_id].empty:
            raise HTTPException(status_code=404, detail=f"Note with id {note_id} not found")
        
        db.delete_note(note_id)
        print(f"Note {note_id} deleted successfully")
        return {"message": f"Note with id {note_id} deleted successfully"}
    except Exception as e:
        print(f"Error deleting note: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 테스트 엔드포인트 추가
@app.get("/api/test/")
def test_api():
    return {"status": "API is working!"}

@app.get("/api/test/notes/")
def test_notes_db():
    try:
        notes_df = db.get_notes()
        count = len(notes_df) if not notes_df.empty else 0
        return {
            "status": "Notes DB connection successful",
            "note_count": count,
            "notes": json.loads(notes_df.to_json(orient='records', date_format='iso')) if not notes_df.empty else []
        }
    except Exception as e:
        return {
            "status": "Error connecting to notes DB",
            "error": str(e)
        }

# 서버 직접 실행 (streamlit 앱과 별도로)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
