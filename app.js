// Simple client-side logic for Tennis Tracker

document.addEventListener('DOMContentLoaded', () => {
    // To-do list
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    if (tasks.length && typeof tasks[0] === 'string') {
        tasks = tasks.map(t => ({ text: t, done: false }));
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach((t, idx) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-white border rounded-md px-3 py-2 shadow-sm hover:shadow transition';

            const box = document.createElement('input');
            box.type = 'checkbox';
            box.checked = t.done;
            box.className = 'h-4 w-4 text-blue-600 border-gray-300 rounded';
            box.addEventListener('change', () => {
                tasks[idx].done = box.checked;
                saveTasks();
                renderTasks();
            });

            const span = document.createElement('span');
            span.className = 'flex-1 ml-2';
            span.textContent = t.text;
            if (t.done) {
                span.classList.add('line-through', 'text-gray-400');
            }

            const btn = document.createElement('button');
            btn.textContent = '✕';
            btn.className = 'ml-2 text-red-500 hover:text-red-700';
            btn.addEventListener('click', () => {
                tasks.splice(idx, 1);
                saveTasks();
                renderTasks();
            });

            li.appendChild(box);
            li.appendChild(span);
            li.appendChild(btn);
            todoList.appendChild(li);
        });
    }

    todoForm.addEventListener('submit', e => {
        e.preventDefault();
        const value = todoInput.value.trim();
        if (value) {
            tasks.push({ text: value, done: false });
            todoInput.value = '';
            saveTasks();
            renderTasks();
        }
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

    let sessions = JSON.parse(localStorage.getItem('sessions') || '[]');

    function saveSessions() {
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }

    function renderSessions() {
        trainingTableBody.innerHTML = '';
        sessions.forEach((s, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${s.date}</td><td>${s.duration}</td><td>${s.type}</td><td>${s.notes}</td>`;
            const delCell = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', () => {
                sessions.splice(idx, 1);
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

    renderSessions();

    // Charts
    const sessionsCtx = document.getElementById('sessions-chart').getContext('2d');
    const typesCtx = document.getElementById('types-chart').getContext('2d');
    let sessionsChart = null;
    let typesChart = null;

    function updateCharts() {
        const sessionsPerMonth = {};
        const typeCount = {};
        sessions.forEach(s => {
            const month = s.date.substring(0,7); // YYYY-MM
            sessionsPerMonth[month] = (sessionsPerMonth[month] || 0) + 1;
            typeCount[s.type] = (typeCount[s.type] || 0) + 1;
        });
        const months = Object.keys(sessionsPerMonth).sort();
        const sessionsData = months.map(m => sessionsPerMonth[m]);

        if (sessionsChart) sessionsChart.destroy();
        sessionsChart = new Chart(sessionsCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{ label: 'Séances', data: sessionsData, fill: false, borderColor: '#3b82f6' }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });

        const types = Object.keys(typeCount);
        const typeData = types.map(t => typeCount[t]);
        if (typesChart) typesChart.destroy();
        typesChart = new Chart(typesCtx, {
            type: 'pie',
            data: { labels: types, datasets: [{ data: typeData }] },
            options: {}
        });
    }

    updateCharts();
});
