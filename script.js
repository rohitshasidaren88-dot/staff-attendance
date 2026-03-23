// ==================== STAFF ATTENDANCE SYSTEM ====================

// Data Users
const users = [
    { email: "master@attendance.com", password: "master123", role: "master", fullname: "Master Admin" },
    { email: "cs@attendance.com", password: "cs123", role: "cs", fullname: "CS User" },
    { email: "kapten@attendance.com", password: "kapten123", role: "kapten", fullname: "Kapten User" }
];

// Data Staff berdasarkan role
const staffData = {
    cs: [
        "REZA PRATAMA EFFENDY", "M IKHSAN", "STEVEN VITORIUS", "FEBRY TIA NATA",
        "WILLY VIJAY SIALLAGAN", "APIN", "ROHIT SHASIDAREN", "INDRA (C7014522) YONG",
        "DONANDA PRATAMA", "RAHUL RAO", "SABRINA PASKAH SAURMA MANIK", "JIWIKA",
        "DEDI SYAHPUTRI", "FAJAR RAMADHAN", "LODI HERMANTO", "RIZKY MAULANA"
    ],
    kapten: [
        "EDOLI MANULLANG", "AINI NADIAH", "AGIL PRAYETNO", "AGUS SUDIANTO",
        "ROBY SUGARA", "JULIO YESAYAS NABABAN"
    ],
    kasir: [
        "PAJAR WIRATAMA SARAGIH", "HERRY SYAPUTRA", "EFRANTA", "ADRIAN PATRIC PRESLY SIMARMATA",
        "SYOFIAH", "GRACE ANGGAWAN HUTABARAT", "DIXIELIA", "KELVIN ADRIAN HRP",
        "MUHAMMAD KHAIRIL", "NATASYA NABILA", "MUHAMMAD NUR RASYDI", "MHD RANGGA PRADINATA",
        "SONIYA", "KRISTIN AUDIA SITUMORANG", "ABELLIA AMANDA", "PUTRI GUSVINA",
        "ADAM DANY PUTRA", "FRAYOGA HARIANJA", "JENNY SAWITRI", "DENNY ANDRIAN",
        "YOGES SUARA", "RIDUWAN EFENDI", "MELITA", "RYAN PERMANA", "TENGKU FAREL DAVILA RUSLI",
        "CIPTO", "JOKO PURNOMO", "KAU SALYA", "SOPHEAP VISAL", "LEA SREY MEY", "CHEA AK RUN"
    ]
};

// Shift Templates
const shiftTemplates = {
    cs: {
        pagi: { checkIn: "08:00:00", checkOut: "18:00:00", jobdesk: ["LINE UTAMA", "LINE BACK-UP", "LIVE CHAT", "LIVE CHAT", "LIVE CHAT", "LIVE CHAT"] },
        gantung: { checkIn: "11:45:00", checkOut: "22:00:00", jobdesk: ["LIVE CHAT"] },
        sore: { checkIn: "14:45:00", checkOut: "01:00:00", jobdesk: ["LINE UTAMA", "LINE BACK-UP", "LIVE CHAT", "LIVE CHAT", "LIVE CHAT", "LIVE CHAT"] },
        malam: { checkIn: "21:45:00", checkOut: "08:00:00", jobdesk: ["LINE UTAMA", "LINE BACK-UP", "LIVE CHAT", "LIVE CHAT"] }
    },
    kapten: {
        pagi: { checkIn: "07:45:00", checkOut: "18:00:00" }
    },
    kasir: {
        pagi: { checkIn: "07:45:00", checkOut: "18:00:00" }
    }
};

// Global Variables
let currentUser = null;
let attendanceData = {};
let fineData = {};

// Initialize data
function initData() {
    const storedAttendance = localStorage.getItem('attendance_data');
    const storedFine = localStorage.getItem('fine_data');
    
    if (storedAttendance) {
        attendanceData = JSON.parse(storedAttendance);
    } else {
        // Initialize empty attendance
        attendanceData = {};
        staffData.cs.forEach(name => { attendanceData[name] = { status: 'belum', checkInTime: null, shift: null }; });
        staffData.kapten.forEach(name => { attendanceData[name] = { status: 'belum', checkInTime: null, shift: null }; });
        staffData.kasir.forEach(name => { attendanceData[name] = { status: 'belum', checkInTime: null, shift: null }; });
        saveAttendance();
    }
    
    if (storedFine) {
        fineData = JSON.parse(storedFine);
    } else {
        fineData = {};
        [...staffData.cs, ...staffData.kapten, ...staffData.kasir].forEach(name => {
            fineData[name] = { amount: 0, paid: false };
        });
        saveFine();
    }
}

function saveAttendance() {
    localStorage.setItem('attendance_data', JSON.stringify(attendanceData));
}

function saveFine() {
    localStorage.setItem('fine_data', JSON.stringify(fineData));
}

// Portal Time Check
function isPortalOpen() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    // Shift schedule: 14:45:00 (14:45 = 14*60+45 = 885 menit)
    const shiftStart = 14 * 60 + 45; // 14:45 = 885 menit
    const portalOpenTime = shiftStart - 45; // 14:00 = 840 menit
    const portalCloseTime = shiftStart - 10; // 14:35 = 875 menit
    
    return currentTime >= portalOpenTime && currentTime <= portalCloseTime;
}

function getPortalStatus() {
    if (isPortalOpen()) {
        return { open: true, message: "PORTAL TERBUKA", badge: "open", text: "ABSEN" };
    } else {
        return { open: false, message: "PORTAL DITUTUP", badge: "closed", text: "PORTAL DITUTUP" };
    }
}

// Check In Function
function checkIn(name, shiftType) {
    if (!isPortalOpen()) {
        Swal.fire('Error', 'Portal sudah ditutup!', 'error');
        return false;
    }
    
    const now = new Date();
    const checkInTime = now.toLocaleTimeString('id-ID');
    
    if (attendanceData[name].status === 'sudah') {
        Swal.fire('Info', 'Anda sudah melakukan absen hari ini!', 'info');
        return false;
    }
    
    attendanceData[name] = {
        status: 'sudah',
        checkInTime: checkInTime,
        shift: shiftType,
        date: now.toLocaleDateString('id-ID')
    };
    
    saveAttendance();
    Swal.fire('Sukses!', `Absen berhasil! Waktu: ${checkInTime}`, 'success');
    return true;
}

// Mark Fine as Paid
function markFinePaid(name) {
    if (fineData[name]) {
        fineData[name].paid = true;
        saveFine();
        Swal.fire('Sukses!', `Denda untuk ${name} telah dibayar`, 'success');
        return true;
    }
    return false;
}

// Calculate Fine (100 THB for late/missing)
function calculateFine() {
    const today = new Date().toLocaleDateString('id-ID');
    const shiftStartTime = 14 * 60 + 45; // 14:45
    
    [...staffData.cs, ...staffData.kapten, ...staffData.kasir].forEach(name => {
        const attendance = attendanceData[name];
        if (attendance.status !== 'sudah') {
            fineData[name].amount = 100;
            fineData[name].paid = false;
        } else {
            // Check if check-in is late
            if (attendance.checkInTime) {
                const [hours, minutes, seconds] = attendance.checkInTime.split(':');
                const checkInMinutes = parseInt(hours) * 60 + parseInt(minutes);
                if (checkInMinutes > shiftStartTime) {
                    fineData[name].amount = 100;
                    fineData[name].paid = false;
                }
            }
        }
    });
    saveFine();
}

// Render Functions
function renderDashboard(role) {
    const portal = getPortalStatus();
    const portalHtml = `
        <div class="portal-status ${portal.open ? 'portal-open' : 'portal-closed'}">
            <h2>${portal.message}</h2>
            <p>Portal dibuka 45 menit sebelum shift (14:00) dan ditutup 10 menit sebelum shift (14:35)</p>
            <div class="portal-badge ${portal.badge}">${portal.text}</div>
            ${portal.open ? '<button class="absen-btn" id="absenBtn"><i class="fas fa-fingerprint"></i> ABSEN SEKARANG</button>' : ''}
        </div>
    `;
    
    document.getElementById('portalStatus').innerHTML = portalHtml;
    
    if (portal.open) {
        document.getElementById('absenBtn')?.addEventListener('click', () => {
            Swal.fire({
                title: 'Pilih Shift',
                text: 'Pilih shift Anda hari ini',
                icon: 'question',
                input: 'select',
                inputOptions: {
                    'pagi': 'Pagi (08:00 - 18:00)',
                    'gantung': 'Gantung (11:45 - 22:00)',
                    'sore': 'Sore (14:45 - 01:00)',
                    'malam': 'Malam (21:45 - 08:00)'
                },
                showCancelButton: true
            }).then(result => {
                if (result.isConfirmed && result.value) {
                    checkIn(currentUser.fullname, result.value);
                    renderAttendanceTable();
                }
            });
        });
    }
}

function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    
    const allStaff = [...staffData.cs, ...staffData.kapten, ...staffData.kasir];
    tbody.innerHTML = '';
    
    allStaff.forEach(name => {
        const attendance = attendanceData[name] || { status: 'belum', checkInTime: null };
        const fine = fineData[name] || { amount: 0, paid: false };
        
        const statusClass = attendance.status === 'sudah' ? 'badge-success' : 'badge-danger';
        const statusText = attendance.status === 'sudah' ? 'SUDAH ABSEN' : 'BELUM ABSEN';
        
        const fineClass = fine.paid ? 'fine-paid' : 'fine-unpaid';
        const fineText = fine.paid ? 'DONE' : `${fine.amount} Bath`;
        
        tbody.innerHTML += `
            <tr>
                <td>${name}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${attendance.checkInTime || '-'}</td>
                <td>${attendance.shift || '-'}</td>
                <td><span class="fine-status ${fineClass}" onclick="handleFineClick('${name}')">${fineText}</span></td>
            </tr>
        `;
    });
}

function handleFineClick(name) {
    if (fineData[name] && !fineData[name].paid) {
        Swal.fire({
            title: 'Konfirmasi Pembayaran Denda',
            text: `Denda untuk ${name} sebesar ${fineData[name].amount} Bath. Sudah dibayar?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Sudah Dibayar',
            cancelButtonText: 'Belum'
        }).then(result => {
            if (result.isConfirmed) {
                markFinePaid(name);
                renderAttendanceTable();
            }
        });
    }
}

// Make functions global
window.handleFineClick = handleFineClick;

// Export for other dashboards
window.staffData = staffData;
window.shiftTemplates = shiftTemplates;
window.attendanceData = attendanceData;
window.fineData = fineData;
window.checkIn = checkIn;
window.markFinePaid = markFinePaid;
window.renderAttendanceTable = renderAttendanceTable;
window.calculateFine = calculateFine;
window.isPortalOpen = isPortalOpen;

// Initialize
initData();
calculateFine();

// Login Function
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.style.display = 'none';
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        errorDiv.innerHTML = 'Email atau password salah!';
        errorDiv.style.display = 'block';
        return;
    }
    
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Redirect based on role
    if (user.role === 'master') {
        window.location.href = 'dashboard-master.html';
    } else if (user.role === 'cs') {
        window.location.href = 'dashboard-cs.html';
    } else if (user.role === 'kapten') {
        window.location.href = 'dashboard-kapten.html';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
});