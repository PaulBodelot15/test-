// Simple client-side logic for Tennis Tracker

document.addEventListener('DOMContentLoaded', () => {
    // To-do list
    const todoForm = document.getElementById('todo-form');
    const todoTitle = document.getElementById('todo-title');
    const todoCategory = document.getElementById('todo-category');
    const todoPriority = document.getElementById('todo-priority');
    const todoDesc = document.getElementById('todo-desc');
    const todoList = document.getElementById('todo-list');
    const todoSubmit = document.getElementById('todo-submit');
    const taskAlert = document.getElementById('task-alert');

    function showAlert(message, color) {
        taskAlert.textContent = message;
        taskAlert.classList.remove('bg-green-500', 'bg-red-500');
        taskAlert.classList.add(color);
        taskAlert.classList.remove('opacity-0');
        setTimeout(() => {
            taskAlert.classList.add('opacity-0');
        }, 2000);
    }
    let editTaskIndex = null;

    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    if (tasks.length && typeof tasks[0] === 'string') {
        tasks = tasks.map(t => ({ title: t, category: '', priority: 'Moyenne', description: '', done: false }));
    } else if (tasks.length && tasks[0].text) {
        tasks = tasks.map(t => ({ title: t.text, category: '', priority: 'Moyenne', description: '', done: t.done || false }));
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach((t, idx) => {
            const li = document.createElement('li');
            li.className = 'flex items-start justify-between bg-white border rounded-md px-3 py-2 shadow-sm hover:shadow transition';

            const box = document.createElement('input');
            box.type = 'checkbox';
            box.checked = t.done;
            box.className = 'mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded';
            box.addEventListener('change', () => {
                tasks[idx].done = box.checked;
                saveTasks();
                renderTasks();
            });

            const info = document.createElement('div');
            info.className = 'flex-1 ml-2';
            const title = document.createElement('div');
            title.textContent = t.title;
            if (t.done) {
                title.classList.add('line-through', 'text-gray-400');
            }
            const meta = document.createElement('div');
            meta.className = 'text-sm text-gray-500';
            meta.textContent = `${t.category} \u2022 ${t.priority}`;
            info.appendChild(title);
            info.appendChild(meta);
            if (t.description) {
                const desc = document.createElement('div');
                desc.className = 'text-sm';
                desc.textContent = t.description;
                info.appendChild(desc);
            }

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Éditer';
            editBtn.className = 'ml-2 text-blue-500 hover:text-blue-700';
            editBtn.addEventListener('click', () => {
                todoTitle.value = t.title;
                todoCategory.value = t.category;
                todoPriority.value = t.priority;
                todoDesc.value = t.description;
                editTaskIndex = idx;
                todoSubmit.textContent = 'Mettre à jour';
            });

            const btn = document.createElement('button');
            btn.textContent = '✕';
            btn.className = 'ml-2 text-red-500 hover:text-red-700';
            btn.addEventListener('click', () => {
                tasks.splice(idx, 1);
                saveTasks();
                renderTasks();
                showAlert('Tâche supprimée', 'bg-red-500');
            });

            li.appendChild(box);
            li.appendChild(info);
            li.appendChild(editBtn);
            li.appendChild(btn);
            todoList.appendChild(li);
        });
    }

    todoForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = todoTitle.value.trim();
        const category = todoCategory.value.trim();
        const priority = todoPriority.value;
        const description = todoDesc.value.trim();
        if (!title || !category || !priority) return;
        if (editTaskIndex !== null) {
            tasks[editTaskIndex] = { title, category, priority, description, done: tasks[editTaskIndex].done };
            editTaskIndex = null;
            todoSubmit.textContent = 'Ajouter';
            showAlert('Tâche mise à jour', 'bg-green-500');
        } else {
            tasks.push({ title, category, priority, description, done: false });
            showAlert('Tâche ajoutée', 'bg-green-500');
        }
        todoForm.reset();
        saveTasks();
        renderTasks();
    });

    function handleEnter(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            todoSubmit.click();
        }
    }
    [todoTitle, todoCategory, todoPriority, todoDesc].forEach(el => {
        el.addEventListener('keypress', handleEnter);
    });

    new Sortable(todoList, {
        animation: 150,
        onEnd: evt => {
            const [moved] = tasks.splice(evt.oldIndex, 1);
            tasks.splice(evt.newIndex, 0, moved);
            saveTasks();
        }
    });

    renderTasks();

    // Player database
    const playerForm = document.getElementById('player-form');
    const playersTableBody = document.querySelector('#players-table tbody');

    let players = JSON.parse(localStorage.getItem('players') || '[]');
    let editIndex = null;

    function savePlayers() {
        localStorage.setItem('players', JSON.stringify(players));
    }

    function renderPlayers() {
        playersTableBody.innerHTML = '';
        players.forEach((p, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${p.name}</td><td>${p.rank}</td><td>${p.notes}</td>`;
            const actions = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Éditer';
            editBtn.addEventListener('click', () => {
                document.getElementById('player-name').value = p.name;
                document.getElementById('player-rank').value = p.rank;
                document.getElementById('player-notes').value = p.notes;
                editIndex = idx;
            });
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', () => {
                players.splice(idx, 1);
                savePlayers();
                renderPlayers();
            });
            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            row.appendChild(actions);
            playersTableBody.appendChild(row);
        });
    }

    playerForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('player-name').value.trim();
        const rank = document.getElementById('player-rank').value.trim();
        const notes = document.getElementById('player-notes').value.trim();
        if (!name) return;
        if (editIndex !== null) {
            players[editIndex] = { name, rank, notes };
            editIndex = null;
        } else {
            players.push({ name, rank, notes });
        }
        playerForm.reset();
        savePlayers();
        renderPlayers();
    });

    renderPlayers();

    // Training journal
    const trainingForm = document.getElementById('training-form');
    const trainingTableBody = document.querySelector('#training-table tbody');
    const filterRange = document.getElementById('filter-range');
    const filterType = document.getElementById('filter-type');

    let sessions = JSON.parse(localStorage.getItem('sessions') || '[]');

    function saveSessions() {
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }

    function getFilteredSessions() {
        let data = [...sessions];
        if (filterRange.value) {
            const days = parseInt(filterRange.value, 10);
            const limit = Date.now() - days * 86400000;
            data = data.filter(s => new Date(s.date).getTime() >= limit);
        }
        if (filterType.value !== 'all') {
            data = data.filter(s => s.type === filterType.value);
        }
        return data;
    }

    function renderSessions() {
        trainingTableBody.innerHTML = '';
        getFilteredSessions().forEach((s, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${s.date}</td><td>${s.duration}</td><td>${s.type}</td><td>${s.notes}</td>`;
            const delCell = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', () => {
                const index = sessions.indexOf(s);
                if (index !== -1) {
                    sessions.splice(index, 1);
                }
                saveSessions();
                renderSessions();
                updateCharts();
            });
            delCell.appendChild(delBtn);
            row.appendChild(delCell);
            trainingTableBody.appendChild(row);
        });
    }

    trainingForm.addEventListener('submit', e => {
        e.preventDefault();
        const date = document.getElementById('training-date').value;
        const duration = document.getElementById('training-duration').value.trim();
        const type = document.getElementById('training-type').value;
        const notes = document.getElementById('training-notes').value.trim();
        if (!date || !duration) return;
        sessions.push({ date, duration, type, notes });
        trainingForm.reset();
        saveSessions();
        renderSessions();
        updateCharts();
    });

    filterRange.addEventListener('change', () => {
        renderSessions();
        updateCharts();
    });
    filterType.addEventListener('change', () => {
        renderSessions();
        updateCharts();
    });

    renderSessions();

    // Charts
    const progressCtx = document.getElementById('progressChart').getContext('2d');
    let progressChart = null;

    function updateCharts() {
        const sessionsPerMonth = {};
        getFilteredSessions().forEach(s => {
            const month = s.date.substring(0,7); // YYYY-MM
            sessionsPerMonth[month] = (sessionsPerMonth[month] || 0) + 1;
        });
        const months = Object.keys(sessionsPerMonth).sort();
        const sessionsData = months.map(m => sessionsPerMonth[m]);

        if (progressChart) progressChart.destroy();
        progressChart = new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{ label: 'Séances', data: sessionsData, fill: false, borderColor: '#3b82f6' }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    updateCharts();
});
