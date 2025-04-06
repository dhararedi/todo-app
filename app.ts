
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoApp {
  private todos: Todo[] = [];
  private input: HTMLInputElement;
  private addBtn: HTMLButtonElement;
  private list: HTMLUListElement;
  private dragStartIndex: number = -1;

  constructor() {
    this.input = document.getElementById('todo-input') as HTMLInputElement;
    this.addBtn = document.getElementById('add-btn') as HTMLButtonElement;
    this.list = document.getElementById('todo-list') as HTMLUListElement;

    this.addBtn.addEventListener('click', () => this.addTodo());
    this.todos = this.loadFromStorage();
    this.renderTodos();
  }

  private loadFromStorage(): Todo[] {
    const data = localStorage.getItem('todos');
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  private addTodo() {
    const text = this.input.value.trim();
    if (text === '') return;

    this.todos.push({ id: Date.now(), text, completed: false });
    this.input.value = '';
    this.saveToStorage();
    this.renderTodos();
  }

  private deleteTodo(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveToStorage();
    this.renderTodos();
  }

  private toggleComplete(id: number) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.saveToStorage();
    this.renderTodos();
  }

  private finishEdit(id: number, inputEl: HTMLInputElement, spanEl: HTMLSpanElement) {
    const newText = inputEl.value.trim();
    if (newText !== '') {
      this.todos = this.todos.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
      );
      this.saveToStorage();
      this.renderTodos();
    }
  }

  private cancelEdit(inputEl: HTMLInputElement, spanEl: HTMLSpanElement) {
    inputEl.style.display = 'none';
    spanEl.style.display = 'inline';
  }

  private reorderTodos(start: number, end: number) {
    const moved = this.todos.splice(start, 1)[0];
    this.todos.splice(end, 0, moved);
    this.saveToStorage();
    this.renderTodos();
  }

  private handleDragStart = (el: HTMLElement) => {
    this.dragStartIndex = parseInt(el.dataset.index!);
    el.classList.add('dragging');
  };

  private handleDragOver = (e: DragEvent, el: HTMLElement) => {
    e.preventDefault();
    el.classList.add('drag-over');
  };

  private handleDrop = (el: HTMLElement) => {
    const endIndex = parseInt(el.dataset.index!);
    this.reorderTodos(this.dragStartIndex, endIndex);
    el.classList.remove('drag-over');
  };

  private handleDragEnd = (el: HTMLElement) => {
    el.classList.remove('dragging');
  };

  private renderTodos() {
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
        if (e.key === 'Enter') this.finishEdit(todo.id, input, span);
        if (e.key === 'Escape') this.cancelEdit(input, span);
      };

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.className = 'edit-btn';
      editBtn.onclick = () => {
        span.style.display = 'none';
        input.style.display = 'inline';
        input.focus();
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '❌';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => this.deleteTodo(todo.id);

      li.appendChild(span);
      li.appendChild(input);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      this.list.appendChild(li);
    });
  }
}

new TodoApp();
