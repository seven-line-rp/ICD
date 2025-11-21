// Journal Page JavaScript

// Check user role
const userRole = localStorage.getItem('userRole') || 'student';

// Get user login from localStorage
const userLogin = localStorage.getItem('userLogin') || 'Пользователь';
document.getElementById('userName').textContent = userLogin;

// Show "Журнал Студентов" button only for teachers
if (userRole === 'teacher') {
    const navSection = document.querySelector('.nav-section');
    if (navSection) {
        const journalLink = document.createElement('a');
        journalLink.href = 'teacher-students.html';
        journalLink.className = 'nav-item';
        journalLink.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Журнал Студентов</span>
        `;
        navSection.insertBefore(journalLink, navSection.firstChild.nextSibling);
    }
}

// Set current date
function updateDate() {
    const now = new Date();
    const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 
                    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dayName = days[now.getDay()];
    
    document.getElementById('currentDate').textContent = `${day} ${month}, ${year}`;
    document.getElementById('currentDay').textContent = dayName;
}

updateDate();

// Notifications System
let notifications = JSON.parse(localStorage.getItem('notifications')) || [
    {
        id: 1,
        title: 'Новое задание',
        message: 'Добавлено новое задание по Web-программированию. Срок сдачи: 20 сентября',
        date: new Date().toISOString(),
        read: false,
        type: 'task'
    }
];

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    const countSpan = document.getElementById('notificationCount');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
        countSpan.textContent = unreadCount;
    } else {
        badge.style.display = 'none';
        countSpan.textContent = '0';
    }
    
    document.getElementById('welcomeMessage').innerHTML = 
        unreadCount > 0 
            ? `С возвращением, ${userLogin}! У тебя есть <span id="notificationCount">${unreadCount}</span> непрочитанное уведомление.`
            : `С возвращением, ${userLogin}! У тебя нет непрочитанных уведомлений.`;
}

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    list.innerHTML = '';
    
    if (notifications.length === 0) {
        list.innerHTML = '<div class="notification-empty">У вас нет уведомлений</div>';
        return;
    }
    
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        item.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-date">${formatDate(notification.date)}</div>
            </div>
            <div class="notification-actions">
                ${!notification.read ? `
                    <button class="mark-read-btn" data-id="${notification.id}">
                        Отметить прочитанным
                    </button>
                ` : ''}
                <button class="delete-notification-btn" data-id="${notification.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
    
    // Add event listeners
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.mark-read-btn').dataset.id);
            markAsRead(id);
        });
    });
    
    document.querySelectorAll('.delete-notification-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.delete-notification-btn').dataset.id);
            deleteNotification(id);
        });
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
    }
}

function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

function addNotification(title, message, type = 'info') {
    const newNotification = {
        id: Date.now(),
        title,
        message,
        date: new Date().toISOString(),
        read: false,
        type
    };
    notifications.unshift(newNotification);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

// Open/Close Notifications Modal
const notificationBtn = document.querySelector('.notification-btn');
const notificationsModal = document.getElementById('notificationsModal');
const closeNotifications = document.getElementById('closeNotifications');

notificationBtn.addEventListener('click', () => {
    renderNotifications();
    notificationsModal.classList.add('active');
});

closeNotifications.addEventListener('click', () => {
    notificationsModal.classList.remove('active');
});

notificationsModal.addEventListener('click', (e) => {
    if (e.target === notificationsModal) {
        notificationsModal.classList.remove('active');
    }
});

// Initialize notifications
updateNotificationBadge();
renderNotifications();

// Notes System
let notes = JSON.parse(localStorage.getItem('notes')) || [];

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function renderNotes() {
    const list = document.getElementById('notesList');
    const empty = document.getElementById('notesEmpty');
    
    if (notes.length === 0) {
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    list.innerHTML = '';
    
    notes.forEach((note, index) => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <div class="note-header">
                <h4 class="note-item-title">${note.title}</h4>
                <button class="delete-note-btn" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
            <div class="note-item-text">${note.text}</div>
            <div class="note-item-date">${formatDate(note.date)}</div>
        `;
        list.appendChild(noteItem);
    });
    
    document.querySelectorAll('.delete-note-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.delete-note-btn').dataset.index);
            deleteNote(index);
        });
    });
}

function addNote(title, text) {
    const newNote = {
        id: Date.now(),
        title,
        text,
        date: new Date().toISOString()
    };
    notes.unshift(newNote);
    saveNotes();
    renderNotes();
}

function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
}

// Add Note Modal
const addNoteBtn = document.getElementById('addNoteBtn');
const addNoteModal = document.getElementById('addNoteModal');
const closeNoteModal = document.getElementById('closeNoteModal');
const noteForm = document.getElementById('noteForm');

addNoteBtn.addEventListener('click', () => {
    addNoteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeNoteModal.addEventListener('click', () => {
    addNoteModal.classList.remove('active');
    document.body.style.overflow = '';
    noteForm.reset();
});

addNoteModal.addEventListener('click', (e) => {
    if (e.target === addNoteModal) {
        addNoteModal.classList.remove('active');
        document.body.style.overflow = '';
        noteForm.reset();
    }
});

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('noteTitle').value.trim();
    const text = document.getElementById('noteText').value.trim();
    
    if (title && text) {
        addNote(title, text);
        addNoteModal.classList.remove('active');
        document.body.style.overflow = '';
        noteForm.reset();
    }
});

// Initialize notes
renderNotes();

// Tasks System - Mark as complete
document.querySelectorAll('.task-item').forEach((task, index) => {
    task.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-note-btn')) {
            task.classList.toggle('completed');
            if (task.classList.contains('completed')) {
                addNotification('Задача выполнена', `Задача "${task.querySelector('.task-title').textContent}" отмечена как выполненная`, 'success');
            }
        }
    });
});

// Schedule - Add click handlers
document.querySelectorAll('.schedule-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
        const subject = item.querySelector('.schedule-subject').textContent;
        addNotification('Напоминание', `Не забудьте про занятие: ${subject}`, 'reminder');
    });
});

// Tab switching
document.querySelectorAll('.tab-icon').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-icon').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// Search functionality
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    // Search in tasks
    document.querySelectorAll('.task-item').forEach(task => {
        const text = task.textContent.toLowerCase();
        task.style.display = text.includes(query) ? 'block' : 'none';
    });
    
    // Search in schedule
    document.querySelectorAll('.schedule-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
    
    // Search in notes
    document.querySelectorAll('.note-item').forEach(note => {
        const text = note.textContent.toLowerCase();
        note.style.display = text.includes(query) ? 'block' : 'none';
    });
});

// Select dropdowns functionality
document.querySelectorAll('.card-select').forEach(select => {
    select.addEventListener('change', (e) => {
        const value = e.target.value;
        // Here you can add logic to filter content based on selection
        console.log('Selected:', value);
    });
});

// Add sample notifications on page load (for demo)
if (notifications.length === 0) {
    addNotification('Добро пожаловать!', 'Вы успешно вошли в систему', 'info');
}

