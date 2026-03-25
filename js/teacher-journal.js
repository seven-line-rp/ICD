// Teacher Journal JavaScript

// Initialize Dexie Database
const db = new Dexie('ICBTeacherDB');
db.version(1).stores({
    students: '++id, name, group, course, email, phone, attendance',
    assignments: '++id, title, subject, dueDate, submitted, total, status',
    courses: '++id, title, group, subject, semester, lessonsPerWeek, progress, nextLesson, description',
    schedule: '++id, day, start, end, subject, group, room, type',
    notifications: '++id, title, message, date, read'
});

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

// Local Storage helpers (now using Dexie)
async function saveData() {
    await db.students.bulkPut(students);
    await db.assignments.bulkPut(assignments);
    await db.courses.bulkPut(courses);
    await db.schedule.bulkPut(schedule);
    await db.notifications.bulkPut(notifications);
}

async function loadData() {
    students = await db.students.toArray();
    assignments = await db.assignments.toArray();
    courses = await db.courses.toArray();
    schedule = await db.schedule.toArray();
    notifications = await db.notifications.toArray();
}

function renderStudents() {
    // re-use existing recent students rendering for dashboard
    renderRecentStudents();
}

// Students Data (will be loaded from Dexie)
let students = [];

// Assignments Data (will be loaded from Dexie)
let assignments = [];

// Courses Data (will be loaded from Dexie)
let courses = [];

// Schedule Data (will be loaded from Dexie)
let schedule = [];

let currentEditingScheduleId = null;

async function initializeDefaultData() {
    if (students.length === 0) {
        students = [
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
        await db.students.bulkPut(students);
    }

    if (assignments.length === 0) {
        assignments = [
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
        await db.assignments.bulkPut(assignments);
    }

    if (courses.length === 0) {
        courses = [
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
        await db.courses.bulkPut(courses);
    }

    if (schedule.length === 0) {
        schedule = [
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
                day: 'Вторник',
                start: '10:00',
                end: '11:30',
                subject: 'Иностранный язык',
                group: 'Группа 1',
                room: 'Ауд. 101',
                type: 'practice'
            },
            {
                id: 4,
                day: 'Среда',
                start: '09:30',
                end: '11:00',
                subject: 'Web-программирование',
                group: 'Группа 1',
                room: 'Лаб. 5',
                type: 'lab'
            },
            {
                id: 5,
                day: 'Среда',
                start: '12:00',
                end: '13:30',
                subject: 'Облачные вычисления',
                group: 'Группа 2',
                room: 'Лаб. 3',
                type: 'lab'
            },
            {
                id: 6,
                day: 'Четверг',
                start: '10:00',
                end: '11:30',
                subject: 'Web-программирование',
                group: 'Группа 2',
                room: 'Ауд. 210',
                type: 'lecture'
            },
            {
                id: 7,
                day: 'Пятница',
                start: '09:00',
                end: '10:30',
                subject: 'Облачные вычисления',
                group: 'Группа 1',
                room: 'Ауд. 205',
                type: 'practice'
            }
        ];
        await db.schedule.bulkPut(schedule);
    }

    if (notifications.length === 0) {
        notifications = [];
        await db.notifications.bulkPut(notifications);
    }
}

async function saveStudents() {
    await db.students.bulkPut(students);
}

async function saveAssignments() {
    await db.assignments.bulkPut(assignments);
}

async function saveSchedule() {
    await db.schedule.bulkPut(schedule);
}

async function saveCourses() {
    await db.courses.bulkPut(courses);
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
        item.addEventListener('click', () => {
            localStorage.setItem('selectedStudentId', student.id);
            window.location.href = 'teacher-students.html';
        });
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

// Notifications (will be loaded from Dexie)
let notifications = [];

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

document.getElementById('assignmentsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openAssignmentsModal();
});

document.getElementById('viewScheduleBtn').addEventListener('click', () => {
    openScheduleModal();
});

document.getElementById('addAssignmentBtn').addEventListener('click', () => {
    openAssignmentForm();
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
    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.group.toLowerCase().includes(query) ||
        String(student.id).includes(query)
    );
    const list = document.getElementById('recentStudentsList');
    list.innerHTML = '';

    if (filtered.length === 0) {
        list.innerHTML = '<div class="notes-empty">Студенты не найдены</div>';
        return;
    }

    filtered.forEach(student => {
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

        item.addEventListener('click', () => {
            localStorage.setItem('selectedStudentId', student.id);
            window.location.href = 'teacher-students.html';
        });

        list.appendChild(item);
    });
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
            <div class="assignment-card">
                <div class="assignment-card-header">
                    <div>
                        <h4>${course.title}</h4>
                        <p class="assignment-meta">${subjectNames[course.subject] || course.subject} • ${course.semester}</p>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-secondary" onclick="editCourse(${course.id})">Редактировать</button>
                        <button class="btn-primary" onclick="deleteCourse(${course.id})">Удалить</button>
                    </div>
                </div>
                <div class="assignment-card-body">
                    <p><strong>Группа:</strong> ${course.group} • ${course.lessonsPerWeek} занятий в неделю</p>
                    <p><strong>Следующее занятие:</strong> ${nextLesson}</p>
                    <p>${course.description || 'Описание отсутствует'}</p>
                </div>
                <div class="assignment-card-footer">
                    <div class="assignment-stats">Прогресс: ${progressPercent}%</div>
                    <div class="assignment-status">${course.group}</div>
                </div>
            </div>
        `;
    }).join('');
}

function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    document.getElementById('courseTitle').value = course.title;
    document.getElementById('courseGroup').value = course.group;
    document.getElementById('courseSubject').value = course.subject;
    document.getElementById('courseSemester').value = course.semester;
    document.getElementById('courseLessonsPerWeek').value = course.lessonsPerWeek;
    document.getElementById('courseNextLesson').value = course.nextLesson;
    document.getElementById('courseDescription').value = course.description;

    document.getElementById('courseFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    document.getElementById('courseForm').onsubmit = (e) => {
        e.preventDefault();
        course.title = document.getElementById('courseTitle').value.trim();
        course.group = document.getElementById('courseGroup').value.trim();
        course.subject = document.getElementById('courseSubject').value;
        course.semester = document.getElementById('courseSemester').value.trim();
        course.lessonsPerWeek = parseInt(document.getElementById('courseLessonsPerWeek').value, 10) || course.lessonsPerWeek;
        course.nextLesson = document.getElementById('courseNextLesson').value;
        course.description = document.getElementById('courseDescription').value.trim();

        saveCourses();
        renderCoursesModal();
        closeCourseForm();
        renderScheduleGrid();
        document.getElementById('courseForm').onsubmit = null;
    };
}

function deleteCourse(courseId) {
    if (!confirm('Удалить курс?')) return;
    courses = courses.filter(c => c.id !== courseId);
    saveCourses();
    renderCoursesModal();
    renderScheduleGrid();
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
    currentEditingScheduleId = null;
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeScheduleForm() {
    document.getElementById('scheduleFormModal').classList.remove('active');
    document.body.style.overflow = '';
}

function openAssignmentsModal() {
    renderAssignmentsModal();
    document.getElementById('assignmentsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAssignmentsModal() {
    document.getElementById('assignmentsModal').classList.remove('active');
    document.body.style.overflow = '';
}

function openAssignmentForm() {
    document.getElementById('assignmentForm').reset();
    document.getElementById('assignmentFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAssignmentForm() {
    document.getElementById('assignmentFormModal').classList.remove('active');
    document.body.style.overflow = '';
}

function renderAssignmentsModal() {
    const summary = document.getElementById('assignmentsSummary');
    const active = assignments.filter(a => a.status === 'active').length;
    const awaitingSubmission = assignments.reduce((sum, a) => sum + (a.total - a.submitted), 0);
    const totalSubmitted = assignments.reduce((sum, a) => sum + a.submitted, 0);
    
    summary.innerHTML = `
        <div class="assignment-summary-card">
            <div class="assignment-summary-title">Активных заданий</div>
            <div class="assignment-summary-value">${active}</div>
        </div>
        <div class="assignment-summary-card">
            <div class="assignment-summary-title">Ожидают отправки</div>
            <div class="assignment-summary-value">${awaitingSubmission}</div>
        </div>
        <div class="assignment-summary-card">
            <div class="assignment-summary-title">Отправлено</div>
            <div class="assignment-summary-value">${totalSubmitted}</div>
        </div>
        <div class="assignment-summary-card">
            <div class="assignment-summary-title">Всего заданий</div>
            <div class="assignment-summary-value">${assignments.length}</div>
        </div>
    `;
    
    const list = document.getElementById('assignmentsList');
    if (assignments.length === 0) {
        list.innerHTML = '<div class="notes-empty" style="grid-column: 1/-1;">Заданий нет</div>';
        return;
    }
    
    const subjectNames = {
        web: 'Web-программирование',
        cloud: 'Облачные вычисления',
        lang: 'Иностранный язык'
    };
    
    list.innerHTML = assignments.map(assignment => {
        const submissionPercent = Math.round((assignment.submitted / assignment.total) * 100);
        const dueDateObj = new Date(assignment.dueDate);
        const now = new Date();
        const isOverdue = dueDateObj < now;
        
        return `
            <div class="assignment-card">
                <div class="assignment-card-header">
                    <div>
                        <h3 class="assignment-title">${assignment.title}</h3>
                        <span class="assignment-subject-chip">${subjectNames[assignment.subject] || assignment.subject}</span>
                    </div>
                    <span class="assignment-status ${assignment.status}">${assignment.status === 'active' ? '✓ Активно' : '✕ Закрыто'}</span>
                </div>
                <div class="assignment-meta">
                    <span class="assignment-meta-pill">${assignment.group}</span>
                    <span class="assignment-meta-pill">До ${new Date(assignment.dueDate).toLocaleDateString('ru-RU')}</span>
                    ${isOverdue ? '<span class="assignment-meta-pill" style="border-color: rgba(239, 68, 68, 0.5); color: #e57373;">Просрочено</span>' : ''}
                </div>
                <div class="assignment-stats">
                    <div class="assignment-stat">
                        <div class="assignment-stat-label">Отправлено</div>
                        <div class="assignment-stat-value">${assignment.submitted}/${assignment.total}</div>
                    </div>
                    <div class="assignment-stat">
                        <div class="assignment-stat-label">Прогресс</div>
                        <div class="assignment-stat-value">${submissionPercent}%</div>
                    </div>
                    <div class="assignment-stat">
                        <div class="assignment-stat-label">Макс. балл</div>
                        <div class="assignment-stat-value">${assignment.maxScore || 100}</div>
                    </div>
                </div>
                <div class="assignment-action">
                    <span class="assignment-action-text">Просмотреть работы студентов</span>
                    <button class="assignment-action-btn" onclick="viewAssignmentSubmissions(${assignment.id})">Открыть</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewAssignmentSubmissions(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
        alert(`Просмотр работ студентов для: ${assignment.title}`);
    }
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
    const grid = document.getElementById('scheduleGrid');
    if (schedule.length === 0) {
        grid.innerHTML = '<div class="notes-empty" style="grid-column: 1 / -1; padding: 40px; text-align: center;">Расписание пока пусто. Добавьте занятия!</div>';
        return;
    }

    grid.innerHTML = schedule
        .sort((a, b) => {
            const dayOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.start.localeCompare(b.start);
        })
        .map(lesson => {
            return `
                <div class="assignment-card">
                    <div class="assignment-card-header">
                        <div>
                            <h4>${lesson.subject}</h4>
                            <p class="assignment-meta">${lesson.group} • ${lesson.day} • ${getLessonTypeName(lesson.type)}</p>
                        </div>
                        <div class="action-buttons">
                            <button class="btn-secondary" onclick="editScheduleLesson(${lesson.id})">Редактировать</button>
                            <button class="btn-primary" onclick="deleteScheduleLesson(${lesson.id})">Удалить</button>
                        </div>
                    </div>
                    <div class="assignment-card-body">
                        <p><strong>Время:</strong> ${lesson.start} — ${lesson.end}</p>
                        <p><strong>Аудитория:</strong> ${lesson.room || 'Не указана'}</p>
                    </div>
                    <div class="assignment-card-footer">
                        <div class="assignment-stats">Тип: ${getLessonTypeName(lesson.type)}</div>
                        <div class="assignment-status">ID: ${lesson.id}</div>
                    </div>
                </div>
            `;
        }).join('');
}

function editScheduleLesson(lessonId) {
    const lesson = schedule.find(s => s.id === lessonId);
    if (!lesson) return;

    currentEditingScheduleId = lessonId;
    document.getElementById('scheduleDay').value = lesson.day;
    document.getElementById('scheduleStart').value = lesson.start;
    document.getElementById('scheduleEnd').value = lesson.end;
    document.getElementById('scheduleSubject').value = lesson.subject;
    document.getElementById('scheduleGroup').value = lesson.group;
    document.getElementById('scheduleRoom').value = lesson.room;
    document.getElementById('scheduleType').value = lesson.type;

    document.getElementById('scheduleFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function deleteScheduleLesson(lessonId) {
    if (!confirm('Удалить занятие?')) return;
    schedule = schedule.filter(item => item.id !== lessonId);
    saveSchedule();
    renderScheduleGrid();
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

document.getElementById('closeAssignmentsModal').addEventListener('click', closeAssignmentsModal);
document.getElementById('assignmentsModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('assignmentsModal')) {
        closeAssignmentsModal();
    }
});

document.getElementById('openAssignmentFormBtn').addEventListener('click', openAssignmentForm);
document.getElementById('closeAssignmentForm').addEventListener('click', closeAssignmentForm);
document.getElementById('assignmentFormModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('assignmentFormModal')) {
        closeAssignmentForm();
    }
});

document.getElementById('scheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const scheduleData = {
        day: document.getElementById('scheduleDay').value,
        start: document.getElementById('scheduleStart').value,
        end: document.getElementById('scheduleEnd').value,
        subject: document.getElementById('scheduleSubject').value.trim(),
        group: document.getElementById('scheduleGroup').value.trim(),
        room: document.getElementById('scheduleRoom').value.trim(),
        type: document.getElementById('scheduleType').value
    };

    if (currentEditingScheduleId) {
        const existingIndex = schedule.findIndex(item => item.id === currentEditingScheduleId);
        if (existingIndex !== -1) {
            schedule[existingIndex] = {
                ...schedule[existingIndex],
                ...scheduleData
            };
        }
        currentEditingScheduleId = null;
    } else {
        schedule.push({ id: Date.now(), ...scheduleData });
    }

    saveSchedule();
    renderScheduleGrid();
    closeScheduleForm();
});

// Initialize
async function initApp() {
    await loadData();
    await initializeDefaultData();
    updateStatistics();
    renderStudents();
    renderRecentAssignments();
    updateNotificationBadge();
    renderCoursesModal();
    renderScheduleGrid();
}

initApp();

window.addEventListener('beforeunload', () => {
    saveData();
});

// Mobile menu functionality
const mobileBurgerBtn = document.getElementById('mobileBurgerBtn');
const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
const sidebar = document.querySelector('.sidebar');
const MOBILE_BREAKPOINT = 600;

function showMobileMenu() {
    if (sidebar) sidebar.classList.add('open');
    if (mobileSidebarOverlay) {
        mobileSidebarOverlay.style.display = 'block';
        mobileSidebarOverlay.classList.add('show');
    }
    if (mobileBurgerBtn) mobileBurgerBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideMobileMenu() {
    if (sidebar) sidebar.classList.remove('open');
    if (mobileSidebarOverlay) {
        mobileSidebarOverlay.classList.remove('show');
        setTimeout(() => {
            mobileSidebarOverlay.style.display = 'none';
        }, 300);
    }
    if (mobileBurgerBtn) mobileBurgerBtn.classList.remove('active');
    document.body.style.overflow = '';
}

function updateMobileMenuVisibility() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        if (mobileBurgerBtn) mobileBurgerBtn.style.display = 'flex';
    } else {
        if (mobileBurgerBtn) mobileBurgerBtn.style.display = 'none';
        hideMobileMenu();
    }
}

if (mobileBurgerBtn) {
    mobileBurgerBtn.addEventListener('click', () => {
        if (sidebar && sidebar.classList.contains('open')) {
            hideMobileMenu();
        } else {
            showMobileMenu();
        }
    });
}

if (mobileSidebarOverlay) {
    mobileSidebarOverlay.addEventListener('click', hideMobileMenu);
}

// Close mobile menu when clicking on navigation items
if (sidebar) {
    sidebar.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                hideMobileMenu();
            }
        });
    });
}

window.addEventListener('resize', updateMobileMenuVisibility);
updateMobileMenuVisibility();

