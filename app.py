import streamlit as st
import pandas as pd
from datetime import datetime
from db_manager import TodoDB

# 데이터베이스 초기화
db = TodoDB()

# 페이지 설정
st.set_page_config(page_title="Todo List App", page_icon="✅")

# 제목
st.title("📝 Todo List Application")

# 데이터베이스에서 할 일 목록 가져오기
todos = db.get_todos()

# 통계 표시
if not todos.empty:
    total_tasks = len(todos)
    completed_tasks = len(todos[todos['status'] == 'Completed'])
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("총 할 일", f"{total_tasks}개")
    with col2:
        st.metric("완료된 할 일", f"{completed_tasks}개")
    with col3:
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        st.metric("완료율", f"{completion_rate:.1f}%")

# 새로운 할 일 입력 폼
with st.form("todo_form", clear_on_submit=True):
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        task = st.text_input("할 일", placeholder="할 일을 입력하세요")
    with col2:
        due_date = st.date_input("마감일")
    with col3:
        priority = st.selectbox("우선순위", ["High", "Medium", "Low"])
    
    submit = st.form_submit_button("추가")
    
    if submit and task:
        db.add_todo(task, due_date.strftime("%Y-%m-%d"), priority)
        st.success("할 일이 추가되었습니다!")
        st.experimental_rerun()

# 할 일 목록 표시
st.subheader("할 일 목록")

# 상태 필터
status_filter = st.selectbox("상태 필터", ["All", "Pending", "Completed"])

if not todos.empty:
    filtered_todos = todos
    if status_filter != "All":
        filtered_todos = filtered_todos[filtered_todos['status'] == status_filter]
    
    # 각 할 일 항목 표시
    for idx, todo in filtered_todos.iterrows():
        col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1, 1])
        
        with col1:
            st.write(f"**{todo['task']}**")
        with col2:
            st.write(f"마감일: {todo['due_date']}")
        with col3:
            st.write(f"우선순위: {todo['priority']}")
        with col4:
            if st.button("완료" if todo['status'] == "Pending" else "취소", key=f"btn_{todo['id']}"):
                new_status = "Completed" if todo['status'] == "Pending" else "Pending"
                db.update_status(todo['id'], new_status)
                st.experimental_rerun()
        with col5:
            if st.button("삭제", key=f"del_{todo['id']}"):
                db.delete_todo(todo['id'])
                st.experimental_rerun()
        
        st.markdown("---")
else:
    st.info("할 일이 없습니다. 새로운 할 일을 추가해보세요!")
