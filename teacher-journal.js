// Teacher Journal JavaScript

// Check if user is teacher
const userRole = localStorage.getItem('userRole');
if (userRole !== 'teacher') {
    window.location.href = 'index.html';
}

// Get teacher login
const teacherLogin = localStorage.getItem('userLogin') || 'Преподаватель';
document.getElementById('userName').textContent = teacherLogin;
document.getElementById('teacherName').textContent = teacherLogin;

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

// Students Data
let students = JSON.parse(localStorage.getItem('teacherStudents')) || [
    {
        id: 1,
        name: 'Иванов Иван Иванович',
        group: 'Группа 1',
        course: 2,
        email: 'ivanov@student.kz',
        phone: '+77001234567',
        grades: [
            { subject: 'web', value: 5, type: 'exam', date: '2025-09-10' },
            { subject: 'cloud', value: 4, type: 'test', date: '2025-09-12' }
        ],
        attendance: 85
    },
    {
        id: 2,
        name: 'Петров Петр Петрович',
        group: 'Группа 1',
        course: 2,
        email: 'petrov@student.kz',
        phone: '+77001234568',
        grades: [
            { subject: 'web', value: 4, type: 'exam', date: '2025-09-10' },
            { subject: 'cloud', value: 5, type: 'test', date: '2025-09-12' }
        ],
        attendance: 92
    },
    {
        id: 3,
        name: 'Сидоров Сидор Сидорович',
        group: 'Группа 2',
        course: 1,
        email: 'sidorov@student.kz',
        phone: '+77001234569',
        grades: [
            { subject: 'lang', value: 3, type: 'exam', date: '2025-09-11' }
        ],
        attendance: 70
    }
];

// Assignments Data
let assignments = JSON.parse(localStorage.getItem('teacherAssignments')) || [
    {
        id: 1,
        title: 'Лабораторная работа по Web-программированию',
        subject: 'web',
        dueDate: '2025-09-20',
        submitted: 12,
        total: 15,
        status: 'active'
    },
    {
        id: 2,
        title: 'Домашнее задание по Облачным вычислениям',
        subject: 'cloud',
        dueDate: '2025-09-18',
        submitted: 8,
        total: 15,
        status: 'active'
    }
];

let courses = JSON.parse(localStorage.getItem('teacherCourses')) || [
    {
        id: 1,
        title: 'Web-программирование',
        group: 'Группа 1',
        subject: 'web',
        semester: 'Осень 2025',
        lessonsPerWeek: 2,
        progress: 0.75,
        nextLesson: '2025-09-15T09:00',
        description: 'Изучение HTML, CSS, JavaScript и базовых принципов фронтенд-разработки.'
    },
    {
        id: 2,
        title: 'Облачные вычисления',
        group: 'Группа 2',
        subject: 'cloud',
        semester: 'Осень 2025',
        lessonsPerWeek: 1,
        progress: 0.4,
        nextLesson: '2025-09-16T11:40',
        description: 'Сервисные модели, деплой и управление ресурсами в AWS/Azure.'
    }
];

let schedule = JSON.parse(localStorage.getItem('teacherSchedule')) || [
    {
        id: 1,
        day: 'Понедельник',
        start: '09:00',
        end: '10:30',
        subject: 'Web-программирование',
        group: 'Группа 1',
        room: 'Ауд. 203',
        type: 'lecture'
    },
    {
        id: 2,
        day: 'Понедельник',
        start: '11:00',
        end: '12:30',
        subject: 'Облачные вычисления',
        group: 'Группа 2',
        room: 'Ауд. 215',
        type: 'practice'
    },
    {
        id: 3,
        day: 'Среда',
        start: '10:00',
        end: '11:30',
        subject: 'Web-программирование',
        group: 'Группа 1',
        room: 'Лаб. 5',
        type: 'lab'
    }
];

function saveStudents() {
    localStorage.setItem('teacherStudents', JSON.stringify(students));
}

function saveAssignments() {
    localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
}

function saveCourses() {
    localStorage.setItem('teacherCourses', JSON.stringify(courses));
}

function saveSchedule() {
    localStorage.setItem('teacherSchedule', JSON.stringify(schedule));
}

// Calculate statistics
function updateStatistics() {
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('totalAssignments').textContent = assignments.filter(a => a.status === 'active').length;
    
    const pendingCount = assignments.reduce((sum, a) => sum + (a.total - a.submitted), 0);
    document.getElementById('pendingReviews').textContent = pendingCount;
    
    // Calculate average grade
    let totalGrades = 0;
    let gradeCount = 0;
    students.forEach(student => {
        student.grades.forEach(grade => {
            totalGrades += grade.value;
            gradeCount++;
        });
    });
    const avgGrade = gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : '0';
    document.getElementById('avgGrade').textContent = avgGrade;
    
    document.getElementById('pendingTasks').textContent = pendingCount;
}

// Render recent students
function renderRecentStudents() {
    const list = document.getElementById('recentStudentsList');
    list.innerHTML = '';
    
    const recent = students.slice(0, 5);
    
    if (recent.length === 0) {
        list.innerHTML = '<div class="notes-empty">Нет студентов</div>';
        return;
    }
    
    recent.forEach(student => {
        const item = document.createElement('div');
        item.className = 'student-item';
        const initials = student.name.split(' ').map(n => n[0]).join('');
        const avgGrade = calculateAverageGrade(student.grades);
        
        item.innerHTML = `
            <div class="student-info">
                <div class="student-avatar">${initials}</div>
                <div class="student-details">
                    <h4>${student.name}</h4>
                    <p>${student.group} • ${student.course} курс • Средний балл: ${avgGrade}</p>
                </div>
            </div>
            <div class="student-actions">
                <a href="teacher-students.html" class="btn-icon view-btn" title="Просмотр">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </a>
            </div>
        `;
        list.appendChild(item);
    });
}

function calculateAverageGrade(grades) {
    if (grades.length === 0) return 'Нет оценок';
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    return (sum / grades.length).toFixed(1);
}

// Render recent assignments
function renderRecentAssignments() {
    const list = document.getElementById('recentAssignmentsList');
    list.innerHTML = '';
    
    const recent = assignments.slice(0, 5);
    
    if (recent.length === 0) {
        list.innerHTML = '<div class="notes-empty">Нет заданий</div>';
        return;
    }
    
    recent.forEach(assignment => {
        const item = document.createElement('div');
        item.className = 'assignment-item';
        const subjectNames = {
            web: 'Web-программирование',
            cloud: 'Облачные вычисления',
            lang: 'Иностранный язык'
        };
        
        item.innerHTML = `
            <div class="assignment-header">
                <div>
                    <div class="assignment-title">${assignment.title}</div>
                    <div class="assignment-date">${subjectNames[assignment.subject]} • Срок: ${formatDate(assignment.dueDate)}</div>
                </div>
            </div>
            <div class="assignment-stats">
                <span>Сдано: ${assignment.submitted}/${assignment.total}</span>
                <span>Осталось: ${assignment.total - assignment.submitted}</span>
            </div>
        `;
        list.appendChild(item);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Notifications
let notifications = JSON.parse(localStorage.getItem('teacherNotifications')) || [];

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
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
                <div class="notification-date">${formatNotificationDate(notification.date)}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

function formatNotificationDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Event Listeners
document.getElementById('viewStudentsBtn').addEventListener('click', () => {
    window.location.href = 'teacher-students.html';
});

document.getElementById('viewScheduleBtn').addEventListener('click', () => {
    openScheduleModal();
});

document.getElementById('addAssignmentBtn').addEventListener('click', () => {
    // Add assignment functionality
    console.log('Add assignment');
});

document.getElementById('coursesBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openCoursesModal();
});

document.getElementById('scheduleBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openScheduleModal();
});

document.getElementById('teacherNotificationsBtn').addEventListener('click', () => {
    renderNotifications();
    document.getElementById('notificationsModal').classList.add('active');
});

document.getElementById('closeNotifications').addEventListener('click', () => {
    document.getElementById('notificationsModal').classList.remove('active');
});

document.getElementById('notificationsModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('notificationsModal')) {
        document.getElementById('notificationsModal').classList.remove('active');
    }
});

// Search
document.getElementById('teacherSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    // Implement search functionality
});

function openCoursesModal() {
    renderCoursesModal();
    document.getElementById('coursesModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCoursesModal() {
    document.getElementById('coursesModal').classList.remove('active');
    document.body.style.overflow = '';
}

function renderCoursesModal() {
    const summary = document.getElementById('coursesSummary');
    const totalLessons = courses.reduce((sum, course) => sum + course.lessonsPerWeek, 0);
    const avgProgress = courses.length
        ? Math.round((courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length) * 100)
        : 0;
    const groups = [...new Set(courses.map(course => course.group))];
    
    summary.innerHTML = `
        <div class="course-summary-card">
            <div class="course-summary-title">Активных курсов</div>
            <div class="course-summary-value">${courses.length}</div>
        </div>
        <div class="course-summary-card">
            <div class="course-summary-title">Группы</div>
            <div class="course-summary-value">${groups.length}</div>
        </div>
        <div class="course-summary-card">
            <div class="course-summary-title">Занятий в неделю</div>
            <div class="course-summary-value">${totalLessons}</div>
        </div>
        <div class="course-summary-card">
            <div class="course-summary-title">Средний прогресс</div>
            <div class="course-summary-value">${avgProgress}%</div>
        </div>
    `;
    
    const list = document.getElementById('coursesList');
    if (courses.length === 0) {
        list.innerHTML = '<div class="notes-empty">У вас пока нет курсов</div>';
        return;
    }
    
    const subjectNames = {
        web: 'Web-программирование',
        cloud: 'Облачные вычисления',
        lang: 'Иностранный язык'
    };
    
    list.innerHTML = courses.map(course => {
        const progressPercent = Math.round((course.progress || 0) * 100);
        const nextLesson = course.nextLesson
            ? new Date(course.nextLesson).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
            : 'Не запланировано';
        return `
            <div class="course-card">
                <div class="course-card-head">
                    <div class="course-card-head-left">
                        <div class="course-card-title">${course.title}</div>
                        <div class="course-card-sub">${subjectNames[course.subject] || course.subject} • ${course.semester}</div>
                    </div>
                    <div class="course-card-progress-value">${progressPercent}%</div>
                </div>
                <div class="course-card-meta">
                    <span>${course.group}</span>
                    <span>${course.lessonsPerWeek} зан./нед</span>
                    <span>ID: ${course.id}</span>
                </div>
                <p class="course-card-desc">${course.description || 'Описание отсутствует'}</p>
                <div class="course-card-progress">
                    <div class="course-card-progress-fill" style="width:${progressPercent}%"></div>
                </div>
                <div class="course-card-footer">
                    <div class="course-card-footer-block">
                        <div class="label">Следующее занятие</div>
                        <div class="value">${nextLesson}</div>
                    </div>
                    <div class="course-card-footer-block align-right">
                        <div class="label">Формат</div>
                        <div class="value">${subjectNames[course.subject] || course.subject}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openCourseForm() {
    document.getElementById('courseForm').reset();
    document.getElementById('courseFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCourseForm() {
    document.getElementById('courseFormModal').classList.remove('active');
    document.body.style.overflow = '';
}

function openScheduleModal() {
    renderScheduleGrid();
    updateScheduleWeekLabel();
    document.getElementById('scheduleModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
    document.body.style.overflow = '';
}

function openScheduleForm() {
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeScheduleForm() {
    document.getElementById('scheduleFormModal').classList.remove('active');
    document.body.style.overflow = '';
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function updateScheduleWeekLabel() {
    const now = new Date();
    const week = getWeekNumber(now);
    document.getElementById('scheduleWeekLabel').textContent = `Неделя ${week}`;
}

function renderScheduleGrid() {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const grid = document.getElementById('scheduleGrid');
    if (schedule.length === 0) {
        grid.innerHTML = '<div class="notes-empty" style="grid-column: 1 / -1;">Расписание пока пусто</div>';
        return;
    }
    
    grid.innerHTML = days.map(day => {
        const lessons = schedule
            .filter(item => item.day === day)
            .sort((a, b) => a.start.localeCompare(b.start));
        
        if (lessons.length === 0) {
            return `
                <div class="schedule-day">
                    <div class="schedule-day-header">${day}</div>
                    <div class="schedule-empty">Нет занятий</div>
                </div>
            `;
        }
        
        const lessonCards = lessons.map(lesson => `
            <div class="schedule-lesson-row">
                <div class="schedule-lesson-time-block">
                    <span>${lesson.start}</span>
                    <span class="dash">—</span>
                    <span>${lesson.end}</span>
                </div>
                <div class="schedule-lesson-info">
                    <div class="schedule-lesson-title">${lesson.subject}</div>
                    <div class="schedule-lesson-meta">${lesson.group} • ${lesson.room || 'Аудитория не указана'}</div>
                </div>
                <span class="lesson-type-pill ${lesson.type}">${getLessonTypeName(lesson.type)}</span>
            </div>
        `).join('');
        
        return `
            <div class="schedule-day">
                <div class="schedule-day-header">
                    <span>${day}</span>
                    <span class="schedule-day-count">${lessons.length} занят.</span>
                </div>
                <div class="schedule-day-body">
                    ${lessonCards}
                </div>
            </div>
        `;
    }).join('');
}

function getLessonTypeName(type) {
    const map = {
        lecture: 'Лекция',
        practice: 'Практика',
        lab: 'Лабораторная'
    };
    return map[type] || type;
}

document.getElementById('closeCoursesModal').addEventListener('click', closeCoursesModal);
document.getElementById('coursesModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('coursesModal')) {
        closeCoursesModal();
    }
});

document.getElementById('openCourseFormBtn').addEventListener('click', openCourseForm);
document.getElementById('closeCourseForm').addEventListener('click', closeCourseForm);
document.getElementById('courseFormModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('courseFormModal')) {
        closeCourseForm();
    }
});

document.getElementById('courseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const course = {
        id: Date.now(),
        title: document.getElementById('courseTitle').value.trim(),
        group: document.getElementById('courseGroup').value.trim(),
        subject: document.getElementById('courseSubject').value,
        semester: document.getElementById('courseSemester').value.trim(),
        lessonsPerWeek: parseInt(document.getElementById('courseLessonsPerWeek').value, 10) || 1,
        progress: 0,
        nextLesson: document.getElementById('courseNextLesson').value,
        description: document.getElementById('courseDescription').value.trim()
    };
    courses.push(course);
    saveCourses();
    renderCoursesModal();
    closeCourseForm();
});

document.getElementById('closeScheduleModal').addEventListener('click', closeScheduleModal);
document.getElementById('scheduleModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('scheduleModal')) {
        closeScheduleModal();
    }
});

document.getElementById('openScheduleFormBtn').addEventListener('click', openScheduleForm);
document.getElementById('closeScheduleForm').addEventListener('click', closeScheduleForm);
document.getElementById('scheduleFormModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('scheduleFormModal')) {
        closeScheduleForm();
    }
});

document.getElementById('scheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const lesson = {
        id: Date.now(),
        day: document.getElementById('scheduleDay').value,
        start: document.getElementById('scheduleStart').value,
        end: document.getElementById('scheduleEnd').value,
        subject: document.getElementById('scheduleSubject').value.trim(),
        group: document.getElementById('scheduleGroup').value.trim(),
        room: document.getElementById('scheduleRoom').value.trim(),
        type: document.getElementById('scheduleType').value
    };
    
    schedule.push(lesson);
    saveSchedule();
    renderScheduleGrid();
    closeScheduleForm();
});

// Initialize
updateStatistics();
renderRecentStudents();
renderRecentAssignments();
updateNotificationBadge();
renderCoursesModal();
renderScheduleGrid();

