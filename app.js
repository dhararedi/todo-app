
"use strict";
class TodoApp {
    constructor() {
        this.todos = [];
        this.dragStartIndex = -1;
        this.handleDragStart = (el) => {
            this.dragStartIndex = parseInt(el.dataset.index);
            el.classList.add('dragging');
        };
        this.handleDragOver = (e, el) => {
            e.preventDefault();
            el.classList.add('drag-over');
        };
        this.handleDrop = (el) => {
            const endIndex = parseInt(el.dataset.index);
            this.reorderTodos(this.dragStartIndex, endIndex);
            el.classList.remove('drag-over');
        };
        this.handleDragEnd = (el) => {
            el.classList.remove('dragging');
        };
        this.input = document.getElementById('todo-input');
        this.addBtn = document.getElementById('add-btn');
        this.list = document.getElementById('todo-list');
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todos = this.loadFromStorage();
        this.renderTodos();
    }
    loadFromStorage() {
        const data = localStorage.getItem('todos');
        return data ? JSON.parse(data) : [];
    }
    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    addTodo() {
        const text = this.input.value.trim();
        if (text === '')
            return;
        this.todos.push({ id: Date.now(), text, completed: false });
        this.input.value = '';
        this.saveToStorage();
        this.renderTodos();
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.renderTodos();
    }
    toggleComplete(id) {
        this.todos = this.todos.map(todo => todo.id === id ? Object.assign(Object.assign({}, todo), { completed: !todo.completed }) : todo);
        this.saveToStorage();
        this.renderTodos();
    }
    finishEdit(id, inputEl, spanEl) {
        const newText = inputEl.value.trim();
        if (newText !== '') {
            this.todos = this.todos.map(todo => todo.id === id ? Object.assign(Object.assign({}, todo), { text: newText }) : todo);
            this.saveToStorage();
            this.renderTodos();
        }
    }
    cancelEdit(inputEl, spanEl) {
        inputEl.style.display = 'none';
        spanEl.style.display = 'inline';
    }
    reorderTodos(start, end) {
        const moved = this.todos.splice(start, 1)[0];
        this.todos.splice(end, 0, moved);
        this.saveToStorage();
        this.renderTodos();
    }
    renderTodos() {
        this.list.innerHTML = '';
        this.todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = todo.completed ? 'completed' : '';
            li.setAttribute('draggable', 'true');
            li.dataset.index = index.toString();
            li.addEventListener('dragstart', () => this.handleDragStart(li));
            li.addEventListener('dragover', (e) => this.handleDragOver(e, li));
            li.addEventListener('drop', () => this.handleDrop(li));
            li.addEventListener('dragend', () => this.handleDragEnd(li));

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = todo.completed;
            checkbox.className = "checkbox";
            checkbox.onclick = () => this.toggleComplete(todo.id);
      
            const span = document.createElement('span');
            span.textContent = todo.text;
            span.className = 'todo-text';
            span.onclick = () => this.toggleComplete(todo.id);
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'edit-input';
            input.value = todo.text;
            input.style.display = 'none';
            input.onblur = () => this.finishEdit(todo.id, input, span);
            input.onkeydown = (e) => {
                if (e.key === 'Enter')
                    this.finishEdit(todo.id, input, span);
                if (e.key === 'Escape')
                    this.cancelEdit(input, span);
            };
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => {
                span.style.display = 'none';
                input.style.display = 'inline';
                input.focus();
            };
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '❌';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => this.deleteTodo(todo.id);
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(input);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            this.list.appendChild(li);
            
        });
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault(); // prevent default tab behavior
                this.addTodo();
            }
        });
        
    }
}
new TodoApp();
