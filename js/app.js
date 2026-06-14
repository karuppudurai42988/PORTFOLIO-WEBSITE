document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const statusAnnouncer = document.getElementById('todo-status');

  let tasks = JSON.parse(localStorage.getItem('portfolio_tasks')) || [];
  let currentFilter = 'all';

  function renderTasks() {
    todoList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true; 
    });

    if (filteredTasks.length === 0) {
      todoList.innerHTML = `<li style="color: var(--text-muted); font-style: italic; padding: 1rem;">No tasks found matching current filter context.</li>`;
      return;
    }

    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'project-card';
      li.style.flexDirection = 'row';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.padding = '1.25rem 2rem';
      li.setAttribute('data-id', task.id);

      const textStyle = task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : '';

      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; flex-grow: 1;">
          <input 
            type="checkbox" 
            id="task-check-${task.id}" 
            class="task-toggle" 
            ${task.completed ? 'checked' : ''} 
            aria-label="Mark completed: ${task.text}">
          <label for="task-check-${task.id}" class="task-text" style="font-weight: 600; cursor: pointer; ${textStyle}">
            ${escapeHTML(task.text)}
          </label>
        </div>
        <div class="project-footer" style="margin: 0;">
          <button class="edit-btn" aria-label="Edit description for: ${task.text}" style="background: none; border: none; color: var(--accent-primary); font-weight:700; cursor:pointer;">Edit</button>
          <button class="delete-btn" aria-label="Delete task: ${task.text}" style="background: none; border: none; color: #c53030; font-weight:700; cursor:pointer;">Delete</button>
        </div>
      `;
      todoList.appendChild(li);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function saveAndSyncState(announcementText) {
    localStorage.setItem('portfolio_tasks', JSON.stringify(tasks));
    renderTasks();
    if (announcementText) {
      statusAnnouncer.textContent = announcementText;
    }
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    
    if (!taskText) return;

    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      completed: false
    };

    tasks.push(newTask);
    todoInput.value = '';
    saveAndSyncState(`Task successfully created: "${taskText}"`);
  });

  todoList.addEventListener('click', (e) => {
    const target = e.target;
    const taskRowId = target.closest('li')?.getAttribute('data-id');
    if (!taskRowId) return;

    const taskIndex = tasks.findIndex(t => t.id === taskRowId);
    if (taskIndex === -1) return;

    if (target.classList.contains('task-toggle')) {
      tasks[taskIndex].completed = target.checked;
      const status = tasks[taskIndex].completed ? 'completed' : 'active';
      saveAndSyncState(`Task marked as ${status}`);
    }

    else if (target.classList.contains('edit-btn')) {
      const updatedText = prompt('Modify task text description:', tasks[taskIndex].text);
      if (updatedText !== null && updatedText.trim() !== '') {
        const oldName = tasks[taskIndex].text;
        tasks[taskIndex].text = updatedText.trim();
        saveAndSyncState(`Task "${oldName}" modified to "${updatedText.trim()}"`);
      }
    }

    else if (target.classList.contains('delete-btn')) {
      const removedText = tasks[taskIndex].text;
      tasks = tasks.filter(t => t.id !== taskRowId);
      saveAndSyncState(`Task safely deleted: "${removedText}"`);
    }
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      currentFilter = btn.getAttribute('data-filter');
      renderTasks();
    });
  });

  renderTasks();
});