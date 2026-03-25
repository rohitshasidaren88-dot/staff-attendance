// Data Staff Global
const staffData = {
    cs: ["REZA PRATAMA EFFENDY","M IKHSAN","STEVEN VITORIUS","FEBRY TIA NATA","WILLY VIJAY SIALLAGAN","APIN","ROHIT SHASIDAREN","INDRA (C7014522) YONG","DONANDA PRATAMA","RAHUL RAO","SABRINA PASKAH SAURMA MANIK","JIWIKA","DEDI SYAHPUTRI","FAJAR RAMADHAN","LODI HERMANTO","RIZKY MAULANA"],
    kapten: ["EDOLI MANULLANG","AINI NADIAH","AGIL PRAYETNO","AGUS SUDIANTO","ROBY SUGARA","JULIO YESAYAS NABABAN"],
    kasir: ["PAJAR WIRATAMA SARAGIH","HERRY SYAPUTRA","EFRANTA","ADRIAN PATRIC PRESLY SIMARMATA","SYOFIAH","GRACE ANGGAWAN HUTABARAT","DIXIELIA","KELVIN ADRIAN HRP","MUHAMMAD KHAIRIL","NATASYA NABILA","MUHAMMAD NUR RASYDI","MHD RANGGA PRADINATA","SONIYA","KRISTIN AUDIA SITUMORANG","ABELLIA AMANDA","PUTRI GUSVINA","ADAM DANY PUTRA","FRAYOGA HARIANJA","JENNY SAWITRI","DENNY ANDRIAN","YOGES SUARA","RIDUWAN EFENDI","MELITA","RYAN PERMANA","TENGKU FAREL DAVILA RUSLI","CIPTO","JOKO PURNOMO","KAU SALYA","SOPHEAP VISAL","LEA SREY MEY","CHEA AK RUN"]
};

let attendanceData = {};
let fineData = {};
let attendanceChart = null;
let currentUser = null;

function saveData() {
    localStorage.setItem('attendance_data', JSON.stringify(attendanceData));
    localStorage.setItem('fine_data', JSON.stringify(fineData));
}

function initData() {
    const stored = localStorage.getItem('attendance_data');
    if (stored) attendanceData = JSON.parse(stored);
    else {
        const allStaff = [...staffData.cs, ...staffData.kapten, ...staffData.kasir];
        allStaff.forEach(n => attendanceData[n] = { status: 'belum', checkInTime: null, shift: null });
        saveData();
    }
    const storedFine = localStorage.getItem('fine_data');
    if (storedFine) fineData = JSON.parse(storedFine);
    else {
        const allStaff = [...staffData.cs, ...staffData.kapten, ...staffData.kasir];
        allStaff.forEach(n => fineData[n] = { amount: 0, paid: false });
        saveData();
    }
}

function isPortalOpen() {
    const now = new Date();
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const shiftStart = 14 * 3600 + 45 * 60;
    return (currentTime >= shiftStart - 45*60) && (currentTime <= shiftStart - 10*60);
}

function getPortalStatus() {
    return isPortalOpen() ? 
        { open: true, message: "PORTAL TERBUKA", badge: "open", text: "ABSEN" } : 
        { open: false, message: "PORTAL DITUTUP", badge: "closed", text: "PORTAL DITUTUP" };
}

function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const allStaff = [...staffData.cs, ...staffData.kapten, ...staffData.kasir];
    allStaff.forEach(name => {
        const att = attendanceData[name] || { status: 'belum', checkInTime: null, shift: null };
        const fine = fineData[name] || { amount: 0, paid: false };
        tbody.innerHTML += `<tr>
            <td>${name}</td>
            <td><span class="badge ${att.status === 'sudah' ? 'badge-success' : 'badge-danger'}">${att.status === 'sudah' ? 'SUDAH ABSEN' : 'BELUM ABSEN'}</span></td>
            <td>${att.checkInTime || '-'}</td>
            <td>${att.shift || '-'}</td>
            <td><span class="fine-status ${fine.paid ? 'fine-paid' : 'fine-unpaid'}" onclick="markFinePaid('${name}')">${fine.paid ? 'DONE' : fine.amount + ' Bath'}</span></td>
        </tr>`;
    });
}

function renderAbsentTable() {
    const tbody = document.getElementById('absentTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const allStaff = [...staffData.cs, ...staffData.kapten, ...staffData.kasir];
    allStaff.forEach(name => {
        const att = attendanceData[name];
        if (att && att.status !== 'sudah') {
            const fine = fineData[name] || { amount: 0, paid: false };
            let role = staffData.cs.includes(name) ? 'CS' : (staffData.kapten.includes(name) ? 'KAPTEN' : 'KASIR');
            tbody.innerHTML += `<tr>
                <td>${name}</td>
                <td>${role}</td>
                <td><span class="badge badge-danger">BELUM ABSEN</span></td>
                <td><span class="fine-status ${fine.paid ? 'fine-paid' : 'fine-unpaid'}" onclick="markFinePaid('${name}')">${fine.paid ? 'DONE' : fine.amount + ' Bath'}</span></td>
                <td><button class="action-btn" onclick="markFinePaid('${name}')">Bayar Denda</button></td>
            </tr>`;
        }
    });
}

function markFinePaid(name) {
    if (fineData[name] && !fineData[name].paid) {
        Swal.fire({
            title: 'Konfirmasi',
            text: `Denda ${fineData[name].amount} Bath untuk ${name} sudah dibayar?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Sudah Dibayar'
        }).then(result => {
            if (result.isConfirmed) {
                fineData[name].paid = true;
                saveData();
                renderAttendanceTable();
                renderAbsentTable();
                if (typeof renderDashboard === 'function') renderDashboard();
                Swal.fire('Sukses!', 'Denda telah dibayar', 'success');
            }
        });
    }
}

// Fungsi shift untuk masing-masing role akan didefinisikan di file dashboard masing-masing
window.markFinePaid = markFinePaid;
