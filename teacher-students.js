// Teacher Students Journal JavaScript

// Check if user is teacher
const userRole = localStorage.getItem('userRole');
if (userRole !== 'teacher') {
    window.location.href = 'index.html';
}

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
            { id: 1, subject: 'web', value: 5, type: 'exam', date: '2025-09-10', comment: 'Отличная работа' },
            { subject: 'cloud', value: 4, type: 'test', date: '2025-09-12', comment: '' }
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
            { subject: 'web', value: 4, type: 'exam', date: '2025-09-10', comment: '' },
            { subject: 'cloud', value: 5, type: 'test', date: '2025-09-12', comment: 'Превосходно' }
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
            { subject: 'lang', value: 3, type: 'exam', date: '2025-09-11', comment: 'Требуется улучшение' }
        ],
        attendance: 70
    },
    {
        id: 4,
        name: 'Козлова Анна Сергеевна',
        group: 'Группа 1',
        course: 2,
        email: 'kozlova@student.kz',
        phone: '+77001234570',
        grades: [
            { subject: 'web', value: 5, type: 'homework', date: '2025-09-08', comment: '' },
            { subject: 'cloud', value: 5, type: 'lab', date: '2025-09-13', comment: '' }
        ],
        attendance: 95
    },
    {
        id: 5,
        name: 'Смирнов Дмитрий Александрович',
        group: 'Группа 2',
        course: 1,
        email: 'smirnov@student.kz',
        phone: '+77001234571',
        grades: [
            { subject: 'lang', value: 4, type: 'midterm', date: '2025-09-09', comment: '' }
        ],
        attendance: 78
    }
];

students = students.map(student => ({
    ...student,
    attendanceRecords: student.attendanceRecords || {}
}));

let filteredStudents = [...students];
let currentEditingStudentId = null;
let currentAttendanceStudentId = null;
let currentAttendanceWeekValue = null;

function saveStudents() {
    localStorage.setItem('teacherStudents', JSON.stringify(students));
}

// Render students table
function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">Студенты не найдены</td></tr>';
        return;
    }
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        const avgGrade = calculateAverageGrade(student.grades);
        const gradeBadges = getGradeBadges(student.grades);
        const attendanceBadge = getAttendanceBadge(student.attendance);
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.group}</td>
            <td>${student.course} курс</td>
            <td>${getSubjectsString(student.grades)}</td>
            <td>${gradeBadges}</td>
            <td><strong>${avgGrade}</strong></td>
            <td>${attendanceBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon grade-btn" onclick="openGradeModal(${student.id})" title="Выставить оценку">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                    </button>
                    <button class="btn-icon view-btn" onclick="viewStudentDetails(${student.id})" title="Просмотр">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-icon attendance-btn" onclick="openAttendanceModal(${student.id})" title="Посещаемость">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="editStudent(${student.id})" title="Редактировать">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteStudent(${student.id})" title="Удалить" style="background: rgba(239, 68, 68, 0.2);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function calculateAverageGrade(grades) {
    if (grades.length === 0) return 'Нет оценок';
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    return (sum / grades.length).toFixed(1);
}

function getGradeBadges(grades) {
    if (grades.length === 0) return '<span style="color: rgba(255,255,255,0.3);">Нет оценок</span>';
    
    const recentGrades = grades.slice(-3);
    return recentGrades.map(grade => {
        let className = 'grade-badge ';
        if (grade.value === 5) className += 'excellent';
        else if (grade.value === 4) className += 'good';
        else if (grade.value === 3) className += 'satisfactory';
        else className += 'unsatisfactory';
        
        return `<span class="${className}">${grade.value}</span>`;
    }).join('');
}

function getAttendanceBadge(attendance) {
    let className = 'attendance-badge ';
    if (attendance >= 90) className += 'high';
    else if (attendance >= 70) className += 'medium';
    else className += 'low';
    
    return `<span class="${className}">${attendance}%</span>`;
}

function getSubjectsString(grades) {
    const subjects = [...new Set(grades.map(g => g.subject))];
    const subjectNames = {
        web: 'Web-прог.',
        cloud: 'Облачные',
        lang: 'Иностранный'
    };
    return subjects.map(s => subjectNames[s] || s).join(', ') || 'Нет предметов';
}

const attendanceStatusMeta = {
    present: { label: 'П', className: 'present', description: 'Присутствие' },
    absent: { label: 'Н', className: 'absent', description: 'Отсутствие' },
    late: { label: 'О', className: 'late', description: 'Опоздание' }
};

const attendanceStatusCycle = [null, 'absent', 'late', 'present'];

function getCurrentMonthValue() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getWeekNumber(date) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
}

function getCurrentWeekValue() {
    const now = new Date();
    return `${now.getFullYear()}-W${String(getWeekNumber(now)).padStart(2, '0')}`;
}

function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay() || 7;
    simple.setDate(simple.getDate() + 1 - dayOfWeek);
    return simple;
}

function getMonthDates(year, month) {
    const dates = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
        const iso = date.toISOString().split('T')[0];
        dates.push(iso);
        date.setDate(date.getDate() + 1);
    }
    return dates;
}

function getWeekDatesFromValue(value) {
    if (!value) return [];
    const [yearPart, weekPart] = value.split('-W');
    const year = parseInt(yearPart, 10);
    const week = parseInt(weekPart, 10);
    if (isNaN(year) || isNaN(week)) return [];
    
    const start = getDateOfISOWeek(week, year);
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return date.toISOString().split('T')[0];
    });
}

function formatWeekRangeLabel(dates) {
    if (!dates.length) return '';
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    const startFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
    const endFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${startFormatter.format(startDate)} — ${endFormatter.format(endDate)}`;
}

function openAttendanceModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    if (!student.attendanceRecords) {
        student.attendanceRecords = {};
    }
    
    currentAttendanceStudentId = studentId;
    document.getElementById('attendanceModalTitle').textContent = `Посещаемость — ${student.name}`;
    
    const monthPicker = document.getElementById('attendanceMonthPicker');
    if (!monthPicker.value) {
        monthPicker.value = getCurrentMonthValue();
    }
    
    renderAttendanceTable();
    
    document.getElementById('attendanceModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAttendanceModal() {
    document.getElementById('attendanceModal').classList.remove('active');
    document.body.style.overflow = '';
    currentAttendanceStudentId = null;
}

function openAttendanceWeekModal() {
    const weekPicker = document.getElementById('attendanceWeekPicker');
    if (weekPicker) {
        if (!weekPicker.value) {
            weekPicker.value = getCurrentWeekValue();
        }
        currentAttendanceWeekValue = weekPicker.value;
    }
    
    renderAttendanceWeekTable();
    
    document.getElementById('attendanceWeekModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAttendanceWeekModal() {
    document.getElementById('attendanceWeekModal').classList.remove('active');
    document.body.style.overflow = '';
}

function renderAttendanceTable() {
    const container = document.getElementById('attendanceTableContainer');
    if (!container || !currentAttendanceStudentId) return;
    
    const student = students.find(s => s.id === currentAttendanceStudentId);
    if (!student) return;
    
    const monthPicker = document.getElementById('attendanceMonthPicker');
    const value = monthPicker.value || getCurrentMonthValue();
    const [year, month] = value.split('-').map(Number);
    const dates = getMonthDates(year, month);
    
    if (dates.length === 0) {
        container.innerHTML = '<div class="notes-empty">Нет данных для выбранного месяца</div>';
        return;
    }
    
    const headerCells = dates.map(date => {
        const day = new Date(date).getDate();
        return `<th>${day}</th>`;
    }).join('');
    
    const bodyCells = dates.map(date => {
        const status = student.attendanceRecords[date] || null;
        const meta = status ? attendanceStatusMeta[status] : null;
        const label = meta ? meta.label : '—';
        const className = meta ? meta.className : '';
        const title = meta ? meta.description : 'Отметить посещаемость';
        return `
            <td>
                <button class="attendance-cell ${className}" data-date="${date}" title="${title}">
                    ${label}
                </button>
            </td>
        `;
    }).join('');
    
    container.innerHTML = `
        <table class="attendance-table">
            <thead>
                <tr>
                    <th>Дата</th>
                    ${headerCells}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Отметка</td>
                    ${bodyCells}
                </tr>
            </tbody>
        </table>
    `;
    
    container.querySelectorAll('.attendance-cell').forEach(cell => {
        cell.addEventListener('click', () => handleAttendanceCellClick(cell.dataset.date));
    });
}

function handleAttendanceCellClick(date) {
    const student = students.find(s => s.id === currentAttendanceStudentId);
    if (!student) return;
    
    cycleAttendanceStatus(student, date);
    saveStudents();
    renderAttendanceTable();
    renderAttendanceWeekTable();
    applyFilters();
}

function getNextAttendanceStatus(currentStatus) {
    const index = attendanceStatusCycle.indexOf(currentStatus);
    if (index === -1) {
        return attendanceStatusCycle[1];
    }
    const nextIndex = (index + 1) % attendanceStatusCycle.length;
    return attendanceStatusCycle[nextIndex];
}

function cycleAttendanceStatus(student, date) {
    if (!student.attendanceRecords) {
        student.attendanceRecords = {};
    }
    
    const currentStatus = student.attendanceRecords[date] || null;
    const nextStatus = getNextAttendanceStatus(currentStatus);
    
    if (nextStatus) {
        student.attendanceRecords[date] = nextStatus;
    } else {
        delete student.attendanceRecords[date];
    }
}

function renderAttendanceWeekTable() {
    const container = document.getElementById('attendanceWeekTable');
    if (!container) return;
    
    const weekPicker = document.getElementById('attendanceWeekPicker');
    const weekValue = weekPicker && weekPicker.value ? weekPicker.value : getCurrentWeekValue();
    const weekDates = getWeekDatesFromValue(weekValue);
    
    const label = formatWeekRangeLabel(weekDates);
    const labelElem = document.getElementById('attendanceWeekLabel');
    if (labelElem && label) {
        labelElem.textContent = label;
    }
    
    if (weekDates.length === 0) {
        container.innerHTML = '<div class="notes-empty">Нет данных для выбранной недели</div>';
        return;
    }
    
    if (students.length === 0) {
        container.innerHTML = '<div class="notes-empty">Нет студентов для отображения</div>';
        return;
    }
    
    const headerCells = weekDates.map(date => {
        const formatted = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric' }).format(new Date(date));
        return `<th>${formatted}</th>`;
    }).join('');
    
    const rows = students.map(student => {
        const cells = weekDates.map(date => {
            if (!student.attendanceRecords) {
                student.attendanceRecords = {};
            }
            const status = student.attendanceRecords[date] || null;
            const meta = status ? attendanceStatusMeta[status] : null;
            const label = meta ? meta.label : '—';
            const className = meta ? meta.className : '';
            const title = meta ? meta.description : 'Отметить посещаемость';
            return `
                <td>
                    <button class="attendance-cell ${className}" data-student="${student.id}" data-date="${date}" title="${title}">
                        ${label}
                    </button>
                </td>
            `;
        }).join('');
        
        return `
            <tr>
                <td class="attendance-student-col">
                    <div class="student-name">${student.name}</div>
                    <div class="student-meta">${student.group} • ${student.course} курс</div>
                </td>
                ${cells}
            </tr>
        `;
    }).join('');
    
    container.innerHTML = `
        <table class="attendance-table attendance-week-table">
            <thead>
                <tr>
                    <th>Студент</th>
                    ${headerCells}
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
    
    container.querySelectorAll('.attendance-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const studentId = parseInt(cell.dataset.student, 10);
            const date = cell.dataset.date;
            handleWeekAttendanceCellClick(studentId, date);
        });
    });
}

function handleWeekAttendanceCellClick(studentId, date) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    cycleAttendanceStatus(student, date);
    saveStudents();
    renderAttendanceWeekTable();
    
    if (currentAttendanceStudentId === studentId) {
        renderAttendanceTable();
    }
    
    applyFilters();
}

// Assignments Data
let assignments = JSON.parse(localStorage.getItem('teacherAssignments')) || [
    {
        id: 1,
        title: 'Лабораторная работа №1: Создание HTML страницы',
        subject: 'web',
        group: 'Группа 1',
        description: 'Создайте HTML страницу с использованием семантических тегов. Страница должна содержать header, nav, main, section и footer. Добавьте стили через CSS.',
        dueDate: '2025-09-25',
        maxScore: 10,
        submissions: [
            { studentId: 1, studentName: 'Иванов Иван Иванович', submitted: true, submittedDate: '2025-09-20', file: 'lab1_ivanov.zip', score: null, comment: '', reviewed: false },
            { studentId: 2, studentName: 'Петров Петр Петрович', submitted: true, submittedDate: '2025-09-21', file: 'lab1_petrov.zip', score: null, comment: '', reviewed: false },
            { studentId: 4, studentName: 'Козлова Анна Сергеевна', submitted: true, submittedDate: '2025-09-19', file: 'lab1_kozlova.zip', score: 9, comment: 'Хорошая работа, но можно улучшить структуру', reviewed: true }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: 'Домашнее задание: Основы облачных вычислений',
        subject: 'cloud',
        group: 'all',
        description: 'Изучите основные концепции облачных вычислений. Напишите эссе на 500-700 слов о преимуществах и недостатках облачных технологий.',
        dueDate: '2025-09-22',
        maxScore: 15,
        submissions: [
            { studentId: 1, studentName: 'Иванов Иван Иванович', submitted: true, submittedDate: '2025-09-18', file: 'essay_ivanov.pdf', score: 14, comment: 'Отличная работа, хорошо структурировано', reviewed: true },
            { studentId: 2, studentName: 'Петров Петр Петрович', submitted: true, submittedDate: '2025-09-20', file: 'essay_petrov.pdf', score: 12, comment: 'Хорошее эссе, но не хватает примеров', reviewed: true },
            { studentId: 3, studentName: 'Сидоров Сидор Сидорович', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false },
            { studentId: 4, studentName: 'Козлова Анна Сергеевна', submitted: true, submittedDate: '2025-09-21', file: 'essay_kozlova.pdf', score: null, comment: '', reviewed: false }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        title: 'Лабораторная работа №2: JavaScript основы',
        subject: 'web',
        group: 'Группа 1',
        description: 'Создайте интерактивную веб-страницу с использованием JavaScript. Реализуйте минимум 3 функции: валидация формы, динамическое добавление элементов, обработка событий.',
        dueDate: '2025-09-28',
        maxScore: 20,
        submissions: [
            { studentId: 1, studentName: 'Иванов Иван Иванович', submitted: true, submittedDate: '2025-09-25', file: 'lab2_ivanov.zip', score: 18, comment: 'Отличная реализация всех требований', reviewed: true },
            { studentId: 2, studentName: 'Петров Петр Петрович', submitted: true, submittedDate: '2025-09-26', file: 'lab2_petrov.zip', score: null, comment: '', reviewed: false },
            { studentId: 4, studentName: 'Козлова Анна Сергеевна', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        title: 'Практическая работа: Настройка облачного хранилища',
        subject: 'cloud',
        group: 'Группа 2',
        description: 'Настройте облачное хранилище (AWS S3, Google Cloud Storage или Azure Blob). Создайте bucket, загрузите файлы, настройте права доступа. Предоставьте скриншоты и краткое описание процесса.',
        dueDate: '2025-09-30',
        maxScore: 25,
        submissions: [
            { studentId: 3, studentName: 'Сидоров Сидор Сидорович', submitted: true, submittedDate: '2025-09-28', file: 'cloud_setup_sidorov.zip', score: 22, comment: 'Хорошая работа, все требования выполнены', reviewed: true },
            { studentId: 5, studentName: 'Смирнов Дмитрий Александрович', submitted: true, submittedDate: '2025-09-29', file: 'cloud_setup_smirnov.zip', score: null, comment: '', reviewed: false }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 5,
        title: 'Домашнее задание: Грамматика английского языка',
        subject: 'lang',
        group: 'all',
        description: 'Выполните упражнения по грамматике: Present Perfect, Past Simple, Future Tenses. Упражнения 1-50 из учебника. Пришлите фотографии выполненных заданий или отсканированные страницы.',
        dueDate: '2025-09-27',
        maxScore: 30,
        submissions: [
            { studentId: 1, studentName: 'Иванов Иван Иванович', submitted: true, submittedDate: '2025-09-24', file: 'grammar_ivanov.pdf', score: 28, comment: 'Отлично выполнено, всего 2 ошибки', reviewed: true },
            { studentId: 3, studentName: 'Сидоров Сидор Сидорович', submitted: true, submittedDate: '2025-09-25', file: 'grammar_sidorov.pdf', score: 24, comment: 'Хорошо, но нужно больше практики с временами', reviewed: true },
            { studentId: 5, studentName: 'Смирнов Дмитрий Александрович', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 6,
        title: 'Проект: Создание веб-приложения',
        subject: 'web',
        group: 'Группа 1',
        description: 'Создайте полноценное веб-приложение (например, todo-лист, блог, интернет-магазин). Используйте HTML, CSS, JavaScript. Приложение должно быть интерактивным и иметь красивый дизайн. Срок: 2 недели.',
        dueDate: '2025-10-10',
        maxScore: 50,
        submissions: [
            { studentId: 1, studentName: 'Иванов Иван Иванович', submitted: true, submittedDate: '2025-10-08', file: 'project_ivanov.zip', score: null, comment: '', reviewed: false },
            { studentId: 2, studentName: 'Петров Петр Петрович', submitted: true, submittedDate: '2025-10-09', file: 'project_petrov.zip', score: null, comment: '', reviewed: false },
            { studentId: 4, studentName: 'Козлова Анна Сергеевна', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 7,
        title: 'Лабораторная работа: Миграция данных в облако',
        subject: 'cloud',
        group: 'Группа 2',
        description: 'Выполните миграцию базы данных в облачную среду. Создайте резервную копию, перенесите данные, протестируйте работоспособность. Опишите процесс и возможные проблемы.',
        dueDate: '2025-10-05',
        maxScore: 30,
        submissions: [
            { studentId: 3, studentName: 'Сидоров Сидор Сидорович', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false },
            { studentId: 5, studentName: 'Смирнов Дмитрий Александрович', submitted: true, submittedDate: '2025-10-03', file: 'migration_smirnov.zip', score: null, comment: '', reviewed: false }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 8,
        title: 'Домашнее задание: Эссе на английском языке',
        subject: 'lang',
        group: 'all',
        description: 'Напишите эссе на тему "The Impact of Technology on Modern Education" (300-400 слов). Используйте академический стиль, правильную грамматику и структуру эссе (введение, основная часть, заключение).',
        dueDate: '2025-10-01',
        maxScore: 25,
        submissions: [
            { studentId: 1, studentName: 'Иванов Иван Иванович', submitted: true, submittedDate: '2025-09-29', file: 'essay_tech_ivanov.pdf', score: 23, comment: 'Отличное эссе, хорошая структура и аргументация', reviewed: true },
            { studentId: 2, studentName: 'Петров Петр Петрович', submitted: true, submittedDate: '2025-09-30', file: 'essay_tech_petrov.pdf', score: null, comment: '', reviewed: false },
            { studentId: 4, studentName: 'Козлова Анна Сергеевна', submitted: true, submittedDate: '2025-09-28', file: 'essay_tech_kozlova.pdf', score: 25, comment: 'Превосходная работа!', reviewed: true }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 9,
        title: 'Лабораторная работа №3: React компоненты',
        subject: 'web',
        group: 'Группа 1',
        description: 'Создайте React приложение с использованием функциональных компонентов и хуков. Реализуйте минимум 5 компонентов, используйте props и state. Добавьте роутинг.',
        dueDate: '2025-10-08',
        maxScore: 35,
        submissions: [
            { studentId: 1, studentName: 'Иванов Иван Иванович', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false },
            { studentId: 2, studentName: 'Петров Петр Петрович', submitted: true, submittedDate: '2025-10-06', file: 'react_lab_petrov.zip', score: null, comment: '', reviewed: false },
            { studentId: 4, studentName: 'Козлова Анна Сергеевна', submitted: true, submittedDate: '2025-10-05', file: 'react_lab_kozlova.zip', score: 32, comment: 'Отличная работа с компонентами', reviewed: true }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: 10,
        title: 'Практическая работа: Docker и контейнеризация',
        subject: 'cloud',
        group: 'Группа 2',
        description: 'Создайте Dockerfile для веб-приложения, соберите образ, запустите контейнер. Напишите docker-compose.yml для многосервисного приложения. Предоставьте скриншоты и описание.',
        dueDate: '2025-10-12',
        maxScore: 40,
        submissions: [
            { studentId: 3, studentName: 'Сидоров Сидор Сидорович', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false },
            { studentId: 5, studentName: 'Смирнов Дмитрий Александрович', submitted: false, submittedDate: null, file: null, score: null, comment: '', reviewed: false }
        ],
        createdAt: new Date().toISOString()
    }
];

function saveAssignments() {
    localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
}

// Filters
document.getElementById('groupFilter').addEventListener('change', applyFilters);
document.getElementById('courseFilter').addEventListener('change', applyFilters);
document.getElementById('subjectFilter').addEventListener('change', applyFilters);

function applyFilters() {
    const groupFilter = document.getElementById('groupFilter').value;
    const courseFilter = document.getElementById('courseFilter').value;
    const subjectFilter = document.getElementById('subjectFilter').value;
    
    filteredStudents = students.filter(student => {
        if (groupFilter !== 'all' && student.group !== groupFilter) return false;
        if (courseFilter !== 'all' && student.course !== parseInt(courseFilter)) return false;
        if (subjectFilter !== 'all' && !student.grades.some(g => g.subject === subjectFilter)) return false;
        return true;
    });
    
    renderStudentsTable();
}

// Search
document.getElementById('studentSearchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.group.toLowerCase().includes(query)
    );
    renderStudentsTable();
});

// Add/Edit Student
document.getElementById('addStudentBtn').addEventListener('click', () => {
    currentEditingStudentId = null;
    document.getElementById('studentModalTitle').textContent = 'Добавить студента';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('studentModal').classList.add('active');
    document.body.style.overflow = 'hidden';
});

document.getElementById('closeStudentModal').addEventListener('click', () => {
    document.getElementById('studentModal').classList.remove('active');
    document.body.style.overflow = '';
});

document.getElementById('studentModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('studentModal')) {
        document.getElementById('studentModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});

document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const studentData = {
        name: document.getElementById('studentName').value.trim(),
        group: document.getElementById('studentGroup').value.trim(),
        course: parseInt(document.getElementById('studentCourse').value),
        email: document.getElementById('studentEmail').value.trim(),
        phone: document.getElementById('studentPhone').value.trim(),
        grades: [],
        attendance: 0,
        attendanceRecords: {}
    };
    
    if (currentEditingStudentId) {
        const student = students.find(s => s.id === currentEditingStudentId);
        studentData.id = currentEditingStudentId;
        studentData.grades = student.grades;
        studentData.attendance = student.attendance;
        studentData.attendanceRecords = student.attendanceRecords || {};
        const index = students.findIndex(s => s.id === currentEditingStudentId);
        students[index] = studentData;
    } else {
        studentData.id = Date.now();
        students.push(studentData);
    }
    
    saveStudents();
    applyFilters();
    document.getElementById('studentModal').classList.remove('active');
    document.body.style.overflow = '';
});

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    currentEditingStudentId = id;
    document.getElementById('studentModalTitle').textContent = 'Редактировать студента';
    document.getElementById('studentId').value = id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentGroup').value = student.group;
    document.getElementById('studentCourse').value = student.course;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentPhone').value = student.phone;
    document.getElementById('studentModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function deleteStudent(id) {
    if (confirm('Вы уверены, что хотите удалить этого студента?')) {
        students = students.filter(s => s.id !== id);
        saveStudents();
        applyFilters();
    }
}

// Grade Modal
function openGradeModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    document.getElementById('gradeStudentId').value = studentId;
    document.getElementById('gradeStudentName').value = student.name;
    document.getElementById('gradeDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('gradeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.getElementById('closeGradeModal').addEventListener('click', () => {
    document.getElementById('gradeModal').classList.remove('active');
    document.body.style.overflow = '';
});

document.getElementById('gradeModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('gradeModal')) {
        document.getElementById('gradeModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});

document.getElementById('closeAttendanceModal').addEventListener('click', closeAttendanceModal);

document.getElementById('attendanceModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('attendanceModal')) {
        closeAttendanceModal();
    }
});

document.getElementById('attendanceMonthPicker').addEventListener('change', () => {
    if (currentAttendanceStudentId) {
        renderAttendanceTable();
    }
});

document.getElementById('attendanceMonthPicker').value = getCurrentMonthValue();

document.getElementById('openAttendanceWeekBtn').addEventListener('click', openAttendanceWeekModal);
document.getElementById('closeAttendanceWeekModal').addEventListener('click', closeAttendanceWeekModal);

document.getElementById('attendanceWeekModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('attendanceWeekModal')) {
        closeAttendanceWeekModal();
    }
});

document.getElementById('attendanceWeekPicker').addEventListener('change', (e) => {
    currentAttendanceWeekValue = e.target.value;
    renderAttendanceWeekTable();
});

document.getElementById('attendanceWeekPicker').value = getCurrentWeekValue();

document.getElementById('gradeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const studentId = parseInt(document.getElementById('gradeStudentId').value);
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const grade = {
        id: Date.now(),
        subject: document.getElementById('gradeSubject').value,
        value: parseInt(document.getElementById('gradeValue').value),
        type: document.getElementById('gradeType').value,
        date: document.getElementById('gradeDate').value,
        comment: document.getElementById('gradeComment').value.trim()
    };
    
    student.grades.push(grade);
    saveStudents();
    applyFilters();
    document.getElementById('gradeModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('gradeForm').reset();
});

// View Student Details
function viewStudentDetails(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    const avgGrade = calculateAverageGrade(student.grades);
    const subjectNames = {
        web: 'Web-программирование',
        cloud: 'Облачные вычисления',
        lang: 'Иностранный язык'
    };
    
    const typeNames = {
        exam: 'Экзамен',
        test: 'Зачет',
        homework: 'Домашнее задание',
        lab: 'Лабораторная',
        midterm: 'Промежуточная'
    };
    
    document.getElementById('studentDetailsName').textContent = student.name;
    
    const content = document.getElementById('studentDetailsContent');
    content.innerHTML = `
        <div class="details-section">
            <h4>Информация о студенте</h4>
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">ФИО</div>
                    <div class="detail-value">${student.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Группа</div>
                    <div class="detail-value">${student.group}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Курс</div>
                    <div class="detail-value">${student.course} курс</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${student.email}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Телефон</div>
                    <div class="detail-value">${student.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Средний балл</div>
                    <div class="detail-value">${avgGrade}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Посещаемость</div>
                    <div class="detail-value">${getAttendanceBadge(student.attendance)}</div>
                </div>
            </div>
        </div>
        
        <div class="details-section">
            <h4>Оценки (${student.grades.length})</h4>
            <div class="grades-list">
                ${student.grades.length === 0 ? '<div class="notes-empty">Нет оценок</div>' : 
                student.grades.map(grade => {
                    let badgeClass = 'grade-badge ';
                    if (grade.value === 5) badgeClass += 'excellent';
                    else if (grade.value === 4) badgeClass += 'good';
                    else if (grade.value === 3) badgeClass += 'satisfactory';
                    else badgeClass += 'unsatisfactory';
                    
                    return `
                        <div class="grade-item">
                            <div class="grade-info">
                                <div class="grade-subject">${subjectNames[grade.subject] || grade.subject}</div>
                                <div class="grade-meta">${typeNames[grade.type] || grade.type} • ${new Date(grade.date).toLocaleDateString('ru-RU')}${grade.comment ? ` • ${grade.comment}` : ''}</div>
                            </div>
                            <div>
                                <span class="grade-badge ${badgeClass.split(' ')[1]} grade-value-large">${grade.value}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('studentDetailsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.getElementById('closeStudentDetailsModal').addEventListener('click', () => {
    document.getElementById('studentDetailsModal').classList.remove('active');
    document.body.style.overflow = '';
});

document.getElementById('studentDetailsModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('studentDetailsModal')) {
        document.getElementById('studentDetailsModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Assignment Management
document.getElementById('addAssignmentBtn').addEventListener('click', () => {
    document.getElementById('assignmentModalTitle').textContent = 'Добавить домашнее задание';
    document.getElementById('assignmentForm').reset();
    document.getElementById('assignmentId').value = '';
    document.getElementById('assignmentDueDate').value = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('assignmentModal').classList.add('active');
    document.body.style.overflow = 'hidden';
});

document.getElementById('closeAssignmentModal').addEventListener('click', () => {
    document.getElementById('assignmentModal').classList.remove('active');
    document.body.style.overflow = '';
});

document.getElementById('assignmentModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('assignmentModal')) {
        document.getElementById('assignmentModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});

document.getElementById('assignmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const assignment = {
        id: Date.now(),
        title: document.getElementById('assignmentTitle').value.trim(),
        subject: document.getElementById('assignmentSubject').value,
        group: document.getElementById('assignmentGroup').value,
        description: document.getElementById('assignmentDescription').value.trim(),
        dueDate: document.getElementById('assignmentDueDate').value,
        maxScore: parseInt(document.getElementById('assignmentMaxScore').value),
        submissions: [],
        createdAt: new Date().toISOString()
    };
    
    // Initialize submissions for students in the group
    const targetStudents = assignment.group === 'all' 
        ? students 
        : students.filter(s => s.group === assignment.group);
    
    targetStudents.forEach(student => {
        assignment.submissions.push({
            studentId: student.id,
            studentName: student.name,
            submitted: false,
            submittedDate: null,
            file: null,
            score: null,
            comment: '',
            reviewed: false
        });
    });
    
    assignments.push(assignment);
    saveAssignments();
    document.getElementById('assignmentModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('assignmentForm').reset();
});

// View Assignments
function viewAssignments() {
    const content = document.getElementById('assignmentsListContent');
    content.innerHTML = '';
    
    if (assignments.length === 0) {
        content.innerHTML = '<div class="notes-empty">Нет заданий</div>';
        document.getElementById('assignmentsListModal').classList.add('active');
        return;
    }
    
    const subjectNames = {
        web: 'Web-программирование',
        cloud: 'Облачные вычисления',
        lang: 'Иностранный язык'
    };
    
    assignments.forEach(assignment => {
        const submittedCount = assignment.submissions.filter(s => s.submitted).length;
        const reviewedCount = assignment.submissions.filter(s => s.reviewed).length;
        const pendingCount = submittedCount - reviewedCount;
        
        const item = document.createElement('div');
        item.className = 'assignment-card';
        item.innerHTML = `
            <div class="assignment-card-header">
                <div>
                    <h4>${assignment.title}</h4>
                    <p class="assignment-meta">${subjectNames[assignment.subject]} • ${assignment.group === 'all' ? 'Все группы' : assignment.group} • Срок: ${new Date(assignment.dueDate).toLocaleDateString('ru-RU')}</p>
                </div>
                <button class="btn-icon view-btn" onclick="viewAssignmentDetails(${assignment.id})" title="Просмотр">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
            <div class="assignment-card-body">
                <p>${assignment.description}</p>
            </div>
            <div class="assignment-card-footer">
                <div class="assignment-stats">
                    <span>Сдано: ${submittedCount}/${assignment.submissions.length}</span>
                    <span>Проверено: ${reviewedCount}</span>
                    ${pendingCount > 0 ? `<span style="color: #ffb74d;">На проверке: ${pendingCount}</span>` : ''}
                </div>
                ${pendingCount > 0 ? `<button class="btn-primary" onclick="reviewAssignment(${assignment.id})" style="padding: 8px 16px; font-size: 13px;">Проверить (${pendingCount})</button>` : ''}
            </div>
        `;
        content.appendChild(item);
    });
    
    document.getElementById('assignmentsListModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.getElementById('closeAssignmentsListModal').addEventListener('click', () => {
    document.getElementById('assignmentsListModal').classList.remove('active');
    document.body.style.overflow = '';
});

document.getElementById('assignmentsListModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('assignmentsListModal')) {
        document.getElementById('assignmentsListModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});

function viewAssignmentDetails(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const subjectNames = {
        web: 'Web-программирование',
        cloud: 'Облачные вычисления',
        lang: 'Иностранный язык'
    };
    
    const content = document.getElementById('reviewContent');
    content.innerHTML = `
        <div class="assignment-details">
            <div class="details-section">
                <h4>Информация о задании</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Название</div>
                        <div class="detail-value">${assignment.title}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Предмет</div>
                        <div class="detail-value">${subjectNames[assignment.subject]}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Группа</div>
                        <div class="detail-value">${assignment.group === 'all' ? 'Все группы' : assignment.group}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Срок сдачи</div>
                        <div class="detail-value">${new Date(assignment.dueDate).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Максимальный балл</div>
                        <div class="detail-value">${assignment.maxScore}</div>
                    </div>
                </div>
                <div class="detail-item" style="margin-top: 16px;">
                    <div class="detail-label">Описание</div>
                    <div class="detail-value">${assignment.description}</div>
                </div>
            </div>
            
            <div class="details-section">
                <h4>Работы студентов (${assignment.submissions.length})</h4>
                <div class="submissions-list">
                    ${assignment.submissions.map(submission => {
                        const student = students.find(s => s.id === submission.studentId);
                        return `
                            <div class="submission-item ${submission.submitted ? 'submitted' : 'not-submitted'}">
                                <div class="submission-header">
                                    <div>
                                        <strong>${submission.studentName}</strong>
                                        ${student ? `<span style="color: rgba(255,255,255,0.5); font-size: 12px;"> • ${student.group}</span>` : ''}
                                    </div>
                                    ${submission.submitted ? 
                                        `<span class="submission-status submitted-status">Сдано ${new Date(submission.submittedDate).toLocaleDateString('ru-RU')}</span>` : 
                                        `<span class="submission-status not-submitted-status">Не сдано</span>`
                                    }
                                </div>
                                ${submission.submitted ? `
                                    <div class="submission-body">
                                        <p><strong>Файл:</strong> ${submission.file}</p>
                                        ${submission.reviewed ? `
                                            <div class="submission-review">
                                                <p><strong>Оценка:</strong> <span class="grade-badge ${getGradeClass(submission.score, assignment.maxScore)}">${submission.score}/${assignment.maxScore}</span></p>
                                                ${submission.comment ? `<p><strong>Комментарий:</strong> ${submission.comment}</p>` : ''}
                                            </div>
                                        ` : `
                                            <button class="btn-primary" onclick="reviewSubmission(${assignmentId}, ${submission.studentId})" style="margin-top: 12px; padding: 8px 16px; font-size: 13px;">Проверить</button>
                                        `}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('reviewAssignmentModal').classList.remove('active');
    document.getElementById('assignmentsListModal').classList.remove('active');
    document.getElementById('reviewAssignmentTitle').textContent = assignment.title;
    document.getElementById('reviewAssignmentModal').classList.add('active');
}

function getGradeClass(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'satisfactory';
    return 'unsatisfactory';
}

function reviewAssignment(assignmentId) {
    viewAssignmentDetails(assignmentId);
}

function reviewSubmission(assignmentId, studentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const submission = assignment.submissions.find(s => s.studentId === studentId);
    if (!submission || !submission.submitted) return;
    
    const student = students.find(s => s.id === studentId);
    const subjectNames = {
        web: 'Web-программирование',
        cloud: 'Облачные вычисления',
        lang: 'Иностранный язык'
    };
    
    const content = document.getElementById('reviewContent');
    content.innerHTML = `
        <div class="review-form-container">
            <div class="review-header-card">
                <div class="review-student-avatar">
                    ${submission.studentName.split(' ').map(n => n[0]).join('')}
                </div>
                <div class="review-student-info">
                    <h4>${submission.studentName}</h4>
                    ${student ? `<p class="review-meta">${student.group} • ${student.course} курс</p>` : ''}
                </div>
            </div>
            
            <div class="review-assignment-info">
                <div class="info-row">
                    <span class="info-label">Задание:</span>
                    <span class="info-value">${assignment.title}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Предмет:</span>
                    <span class="info-value">${subjectNames[assignment.subject]}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Файл:</span>
                    <span class="info-value file-link">${submission.file}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Дата сдачи:</span>
                    <span class="info-value">${new Date(submission.submittedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Максимальный балл:</span>
                    <span class="info-value">${assignment.maxScore}</span>
                </div>
            </div>
            
            <form id="reviewForm" onsubmit="submitReview(event, ${assignmentId}, ${studentId})" class="review-form">
                <div class="form-group">
                    <label>Оценка</label>
                    <div class="score-input-wrapper">
                        <input type="number" id="reviewScore" min="0" max="${assignment.maxScore}" value="${submission.score || ''}" required class="score-input">
                        <span class="score-max">/ ${assignment.maxScore}</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Комментарий к работе</label>
                    <textarea id="reviewComment" rows="6" placeholder="Оставьте комментарий к работе студента...">${submission.comment || ''}</textarea>
                </div>
                <div class="review-form-actions">
                    <button type="button" class="btn-secondary" onclick="viewAssignmentDetails(${assignmentId})">Назад</button>
                    <button type="submit" class="btn-primary">Сохранить оценку</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('reviewAssignmentTitle').textContent = `Проверка работы`;
}

function submitReview(e, assignmentId, studentId) {
    e.preventDefault();
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const submission = assignment.submissions.find(s => s.studentId === studentId);
    if (!submission) return;
    
    submission.score = parseInt(document.getElementById('reviewScore').value);
    submission.comment = document.getElementById('reviewComment').value.trim();
    submission.reviewed = true;
    
    // Add grade to student
    const student = students.find(s => s.id === studentId);
    if (student) {
        const subjectNames = {
            web: 'web',
            cloud: 'cloud',
            lang: 'lang'
        };
        
        student.grades.push({
            id: Date.now(),
            subject: assignment.subject,
            value: Math.round((submission.score / assignment.maxScore) * 5),
            type: 'homework',
            date: new Date().toISOString().split('T')[0],
            comment: `ДЗ: ${assignment.title}`
        });
        saveStudents();
    }
    
    saveAssignments();
    viewAssignmentDetails(assignmentId);
}

// Add button to view assignments in table
function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">Студенты не найдены</td></tr>';
        return;
    }
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        const avgGrade = calculateAverageGrade(student.grades);
        const gradeBadges = getGradeBadges(student.grades);
        const attendanceBadge = getAttendanceBadge(student.attendance);
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.group}</td>
            <td>${student.course} курс</td>
            <td>${getSubjectsString(student.grades)}</td>
            <td>${gradeBadges}</td>
            <td><strong>${avgGrade}</strong></td>
            <td>${attendanceBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon grade-btn" onclick="openGradeModal(${student.id})" title="Выставить оценку">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                    </button>
                    <button class="btn-icon view-btn" onclick="viewStudentDetails(${student.id})" title="Просмотр">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-icon attendance-btn" onclick="openAttendanceModal(${student.id})" title="Посещаемость">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="editStudent(${student.id})" title="Редактировать">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteStudent(${student.id})" title="Удалить" style="background: rgba(239, 68, 68, 0.2);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// View assignments button is already in filters bar

document.getElementById('closeReviewModal').addEventListener('click', () => {
    document.getElementById('reviewAssignmentModal').classList.remove('active');
    document.body.style.overflow = '';
});

document.getElementById('reviewAssignmentModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('reviewAssignmentModal')) {
        document.getElementById('reviewAssignmentModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Initialize
applyFilters();
saveAssignments();

