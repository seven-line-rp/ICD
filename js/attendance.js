// Attendance Page Script

// Check if user is teacher
const userRole = localStorage.getItem('userRole');
if (userRole !== 'teacher') {
    window.location.hash = '#home';
}

// Sample data
let students = JSON.parse(localStorage.getItem('teacherStudents')) || [
    {
        id: 1,
        name: 'Иванов Иван Иванович',
        group: 'Группа 1',
        course: 2,
        email: 'ivanov@student.kz',
        phone: '+77001234567',
        attendanceRecords: {
            '2025-01-15': { status: 'present', subject: 'web' },
            '2025-01-16': { status: 'present', subject: 'cloud' },
            '2025-01-17': { status: 'late', subject: 'lang' },
            '2025-01-20': { status: 'present', subject: 'web' },
            '2025-01-21': { status: 'absent', subject: 'cloud' }
        }
    },
    {
        id: 2,
        name: 'Петров Петр Петрович',
        group: 'Группа 1',
        course: 2,
        email: 'petrov@student.kz',
        phone: '+77001234568',
        attendanceRecords: {
            '2025-01-15': { status: 'present', subject: 'web' },
            '2025-01-16': { status: 'present', subject: 'cloud' },
            '2025-01-17': { status: 'present', subject: 'lang' },
            '2025-01-20': { status: 'present', subject: 'web' },
            '2025-01-21': { status: 'present', subject: 'cloud' }
        }
    },
    {
        id: 3,
        name: 'Сидоров Сидор Сидорович',
        group: 'Группа 2',
        course: 1,
        email: 'sidorov@student.kz',
        phone: '+77001234569',
        attendanceRecords: {
            '2025-01-15': { status: 'absent', subject: 'lang' },
            '2025-01-16': { status: 'absent', subject: 'web' },
            '2025-01-17': { status: 'late', subject: 'lang' },
            '2025-01-20': { status: 'present', subject: 'web' }
        }
    },
    {
        id: 4,
        name: 'Козлова Анна Сергеевна',
        group: 'Группа 1',
        course: 2,
        email: 'kozlova@student.kz',
        phone: '+77001234570',
        attendanceRecords: {
            '2025-01-15': { status: 'present', subject: 'web' },
            '2025-01-16': { status: 'present', subject: 'cloud' },
            '2025-01-17': { status: 'present', subject: 'lang' },
            '2025-01-20': { status: 'present', subject: 'web' },
            '2025-01-21': { status: 'present', subject: 'cloud' }
        }
    }
];

let currentSelectedStudent = null;
let currentMonth = new Date();

function loadData() {
    const storedStudents = JSON.parse(localStorage.getItem('teacherStudents'));
    if (Array.isArray(storedStudents) && storedStudents.length) {
        students = storedStudents;
    }
}

function saveData() {
    localStorage.setItem('teacherStudents', JSON.stringify(students));
}

// DOM Elements (bound on init)
let studentsList = null;
let attendanceCalendar = null;
let studentInfoPanel = null;
let groupFilter = null;
let monthFilter = null;
let subjectFilter = null;
let resetFiltersBtn = null;
let exportBtn = null;
let closeInfoBtn = null;

let __attendanceBeforeUnloadBound = false;

function bindDom() {
    studentsList = document.getElementById('studentsList');
    attendanceCalendar = document.getElementById('attendanceCalendar');
    studentInfoPanel = document.getElementById('studentInfoPanel');
    groupFilter = document.getElementById('groupFilter');
    monthFilter = document.getElementById('monthFilter');
    subjectFilter = document.getElementById('subjectFilter');
    resetFiltersBtn = document.getElementById('resetFiltersBtn');
    exportBtn = document.getElementById('exportBtn');
    closeInfoBtn = document.getElementById('closeInfoBtn');
}

function initAttendancePage() {
    bindDom();

    // If we're not on the attendance page right now, do nothing.
    if (!studentsList || !monthFilter || !groupFilter || !subjectFilter) return;

    // Set current month
    const today = new Date();
    monthFilter.valueAsDate = today;
    currentMonth = new Date(today);
    currentSelectedStudent = null;

    loadData();
    renderStatistics();
    updateStudentsPanel();
    renderCalendar();
    setupEventListeners();

    if (!__attendanceBeforeUnloadBound) {
        window.addEventListener('beforeunload', () => {
            saveData();
        });
        __attendanceBeforeUnloadBound = true;
    }
}

// SPA mount hook + first run
window.addEventListener('spa:mounted', (e) => {
    if (e?.detail?.hash === '#attendance') initAttendancePage();
});
initAttendancePage();

function setupEventListeners() {
    groupFilter.addEventListener('change', updateStudentsPanel);
    monthFilter.addEventListener('change', () => {
        currentMonth = new Date(monthFilter.valueAsDate);
        renderCalendar();
    });
    subjectFilter.addEventListener('change', renderCalendar);
    resetFiltersBtn.addEventListener('click', resetFilters);
    exportBtn.addEventListener('click', exportData);
    closeInfoBtn.addEventListener('click', () => {
        currentSelectedStudent = null;
        renderStudentInfo();
    });
}

function resetFilters() {
    groupFilter.value = 'all';
    monthFilter.valueAsDate = new Date();
    subjectFilter.value = 'all';
    currentMonth = new Date();
    currentSelectedStudent = null;
    updateStudentsPanel();
    renderCalendar();
    renderStudentInfo();
}

function updateStudentsPanel() {
    const group = groupFilter.value;
    const filtered = group === 'all' 
        ? students 
        : students.filter(s => s.group === group);
    
    document.getElementById('studentsCount').textContent = filtered.length;
    
    studentsList.innerHTML = filtered.map(student => `
        <div class="student-item ${currentSelectedStudent?.id === student.id ? 'active' : ''}" 
             onclick="selectStudent(${student.id})">
            <div class="student-info">
                <span class="student-name">${student.name}</span>
                <span class="student-group">${student.group}</span>
            </div>
            <span class="student-attendance-badge ${calculateAttendance(student) < 75 ? 'low' : ''}">
                ${calculateAttendance(student)}%
            </span>
        </div>
    `).join('');
}

function selectStudent(studentId) {
    currentSelectedStudent = students.find(s => s.id === studentId);
    updateStudentsPanel();
    renderStudentInfo();
    renderCalendar();
}

function calculateAttendance(student) {
    if (!student.attendanceRecords || Object.keys(student.attendanceRecords).length === 0) {
        return 0;
    }
    
    const records = Object.values(student.attendanceRecords);
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const percentage = Math.round((presentCount / records.length) * 100);
    return percentage;
}

function renderStudentInfo() {
    if (!currentSelectedStudent) {
        studentInfoPanel.style.display = 'none';
        return;
    }
    
    studentInfoPanel.style.display = 'flex';
    const records = currentSelectedStudent.attendanceRecords || {};
    const recordsList = Object.entries(records);
    
    const presentCount = recordsList.filter(([_, r]) => r.status === 'present').length;
    const absentCount = recordsList.filter(([_, r]) => r.status === 'absent').length;
    const lateCount = recordsList.filter(([_, r]) => r.status === 'late').length;
    const percentage = calculateAttendance(currentSelectedStudent);
    
    document.getElementById('selectedStudentName').textContent = currentSelectedStudent.name;
    document.getElementById('attendancePercentage').textContent = `${percentage}%`;
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
    document.getElementById('lateCount').textContent = lateCount;
    
    const attendanceRecords = document.getElementById('attendanceRecords');
    attendanceRecords.innerHTML = recordsList
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .slice(0, 20)
        .map(([date, record]) => {
            const d = new Date(date);
            const dateStr = d.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });
            const statusText = {
                'present': 'Присутствие',
                'absent': 'Отсутствие',
                'late': 'Опоздание'
            }[record.status] || 'Неизвестно';
            const subjectName = {
                'web': 'Web-программирование',
                'cloud': 'Облачные вычисления',
                'lang': 'Иностранный язык'
            }[record.subject] || 'Неизвестный предмет';
            
            return `
                <div class="record-item ${record.status}">
                    <div class="record-date">${dateStr}</div>
                    <div class="record-subject">${statusText}</div>
                    <small>${subjectName}</small>
                </div>
            `;
        }).join('');
}

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    let html = `<div class="calendar-month"><h4>${monthNames[month]} ${year}</h4>`;
    
    // Days of week header
    html += '<div class="calendar-week" style="margin-bottom: 12px; opacity: 0.6; font-weight: 600;">';
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    for (let i = 1; i < startingDayOfWeek; i++) {
        html += '<div></div>';
    }
    dayNames.forEach(day => html += `<div style="text-align: center; padding: 8px;">${day}</div>`);
    html += '</div>';
    
    // Days grid
    html += '<div class="calendar-week">';
    let dayCounter = 1;
    let cellsUsed = startingDayOfWeek - 1;
    
    for (let i = 0; i < 42; i++) {
        if (dayCounter > daysInMonth) {
            html += '<div class="calendar-day inactive"></div>';
        } else if (i < cellsUsed) {
            html += '<div class="calendar-day inactive"></div>';
        } else {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
            const record = currentSelectedStudent?.attendanceRecords?.[dateStr];
            const statusClass = record?.status || '';
            const statusText = {
                'present': 'П',
                'absent': 'Н',
                'late': 'О'
            }[record?.status] || '•';
            
            html += `
                <div class="calendar-day ${statusClass}" onclick="toggleAttendance('${dateStr}')">
                    <div class="day-num">${dayCounter}</div>
                    <div class="day-status">${statusText}</div>
                </div>
            `;
            dayCounter++;
        }
        
        if ((i + 1) % 7 === 0) {
            html += '</div><div class="calendar-week">';
        }
    }
    
    html += '</div></div>';
    attendanceCalendar.innerHTML = html;
}

function toggleAttendance(dateStr) {
    if (!currentSelectedStudent) return;
    
    if (!currentSelectedStudent.attendanceRecords) {
        currentSelectedStudent.attendanceRecords = {};
    }
    
    const current = currentSelectedStudent.attendanceRecords[dateStr];
    const statuses = ['present', 'absent', 'late'];
    const nextIndex = current ? (statuses.indexOf(current.status) + 1) % statuses.length : 0;
    const nextStatus = statuses[nextIndex];
    
    if (nextStatus) {
        currentSelectedStudent.attendanceRecords[dateStr] = {
            status: nextStatus,
            subject: subjectFilter.value === 'all' ? 'web' : subjectFilter.value
        };
    } else {
        delete currentSelectedStudent.attendanceRecords[dateStr];
    }
    
    saveStudents();
    renderCalendar();
    updateStudentsPanel();
    renderStudentInfo();
}

function saveStudents() {
    saveData();
}

function renderStatistics() {
    const totalStudents = students.length;
    const avgAttendance = Math.round(
        students.reduce((sum, s) => sum + calculateAttendance(s), 0) / students.length
    );
    const highAttendance = students.filter(s => calculateAttendance(s) >= 85).length;
    const lowAttendance = students.filter(s => calculateAttendance(s) < 75).length;
    
    document.getElementById('totalStudentsCount').textContent = totalStudents;
    document.getElementById('avgAttendance').textContent = `${avgAttendance}%`;
    document.getElementById('highAttendanceCount').textContent = highAttendance;
    document.getElementById('lowAttendanceCount').textContent = lowAttendance;
    
    // Render top students
    const topStudents = students
        .sort((a, b) => calculateAttendance(b) - calculateAttendance(a))
        .slice(0, 5);
    
    document.getElementById('topStudents').innerHTML = topStudents.map((student, idx) => `
        <div class="top-student-item">
            <div class="top-student-rank">№${idx + 1}</div>
            <div class="top-student-info">
                <div class="top-student-name">${student.name}</div>
                <div class="top-student-group">${student.group}</div>
            </div>
            <div class="top-student-percent">${calculateAttendance(student)}%</div>
        </div>
    `).join('');
}

function exportData() {
    let csv = 'Студент,Группа,Посещаемость (%)\n';
    
    students.forEach(student => {
        csv += `"${student.name}","${student.group}",${calculateAttendance(student)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

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
