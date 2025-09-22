const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const BASE_URL = "http://localhost:3000/api";

if (!token) window.location.href = 'index.html';

document.addEventListener('DOMContentLoaded', () => {
    if (role === 'student') {
        document.getElementById('studentNav').style.display = 'block';
        showRooms(); // Default view for students
    } else if (role === 'warden') {
        document.getElementById('adminNav').style.display = 'block';
        showAllRooms(); // Default view for wardens
    }
});

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ----- RENDERING FUNCTIONS -----
function showRooms() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Available Rooms</h2>
        <div id="roomContent" class="data-container"></div>
    `;
    viewRooms();
}

function showBookings() {
    document.getElementById('mainContent').innerHTML = `
        <h2>My Bookings</h2>
        <div id="bookingsContent" class="data-container"></div>
    `;
    viewBookings();
}

function showPayments() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Payments</h2>
        <div id="paymentsForm" class="form-section">
            <input type="text" id="bookingId" placeholder="Booking ID">
            <input type="number" id="paymentAmount" placeholder="Amount">
            <button onclick="makePayment()">Pay</button>
        </div>
        <div id="paymentsContent" class="data-container"></div>
    `;
    viewPayments();
}

function showComplaints() {
    const content = document.getElementById('mainContent');
    if (role === 'student') {
        content.innerHTML = `
            <h2>Make a Complaint</h2>
            <div id="complaintsForm" class="form-section">
                <input type="text" id="complaintRoomId" placeholder="Room ID (optional)">
                <textarea id="complaintText" placeholder="Enter complaint text..." rows="4"></textarea>
                <button onclick="makeComplaint()">Submit Complaint</button>
            </div>
        `;
    } else if (role === 'warden') {
        content.innerHTML = `
            <h2>All Complaints</h2>
            <div id="complaintsContent" class="data-container"></div>
        `;
        viewAllComplaints();
    }
}

function showAllRooms() {
    document.getElementById('mainContent').innerHTML = `
        <h2>All Rooms</h2>
        <div id="roomContent" class="data-container"></div>
    `;
    viewAllRooms();
}

function showAllComplaints() {
    document.getElementById('mainContent').innerHTML = `
        <h2>All Complaints</h2>
        <div id="complaintsContent" class="data-container"></div>
    `;
    viewAllComplaints();
}

// ----- DATA FETCHING AND RENDERING FUNCTIONS -----
async function viewRooms() {
    // FIX: The query now requests 'id' from the backend which will be aliased as 'room_id'
    const res = await fetch(`${BASE_URL}/student/rooms`, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    const roomContent = document.getElementById('roomContent');
    if (!roomContent) return;
    
    if (data.rooms && data.rooms.length > 0) {
        let roomsHtml = '<div class="card-container">';
        data.rooms.forEach(room => {
            roomsHtml += `
                <div class="card">
                    <p><strong>Room No:</strong> ${room.room_no}</p>
                    <p><strong>Type:</strong> ${room.type}</p>
                    <p><strong>Capacity:</strong> ${room.capacity}</p>
                    <p><strong>Occupancy:</strong> ${room.current_occupancy}</p>
                    <button class="book-btn" onclick="bookRoom(${room.room_id})">Book</button>
                </div>
            `;
        });
        roomsHtml += '</div>';
        roomContent.innerHTML = roomsHtml;
    } else {
        roomContent.innerText = 'No rooms found.';
    }
}

async function bookRoom() {
     const roomId = prompt('Enter the room id:');
    const duration_days = prompt('Enter duration in days:');
    if (!duration_days) return;
    const res = await fetch(`${BASE_URL}/student/book`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, duration_days })
    });
    const data = await res.json();
    alert(data.message);
}

async function viewBookings() {
    const res = await fetch(`${BASE_URL}/student/bookings`, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    const bookingsContent = document.getElementById('bookingsContent');
    if (!bookingsContent) return;

    if (data.bookings && data.bookings.length > 0) {
        let bookingsHtml = '<div class="card-container">';
        data.bookings.forEach(booking => {
            bookingsHtml += `
                <div class="card">
                    <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
                    <p><strong>Room No:</strong> ${booking.room_no}</p>
                    <p><strong>Room Type:</strong> ${booking.type}</p>
                    <p><strong>Duration:</strong> ${booking.duration_days} days</p>
                    <p><strong>Status:</strong> ${booking.active ? 'Active' : 'Inactive'}</p>
                </div>
            `;
        });
        bookingsHtml += '</div>';
        bookingsContent.innerHTML = bookingsHtml;
    } else {
        bookingsContent.innerText = 'No bookings found.';
    }
}

async function viewPayments() {
    const res = await fetch(`${BASE_URL}/student/payments`, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    const paymentsContent = document.getElementById('paymentsContent');
    if (!paymentsContent) return;

    if (data.payments && data.payments.length > 0) {
        let paymentsHtml = '<div class="card-container">';
        data.payments.forEach(payment => {
            paymentsHtml += `
                <div class="card">
                    <p><strong>Payment ID:</strong> ${payment.payment_id}</p>
                    <p><strong>Booking ID:</strong> ${payment.booking_id}</p>
                    <p><strong>Amount:</strong> ${payment.amount}</p>
                    <p><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
            `;
        });
        paymentsHtml += '</div>';
        paymentsContent.innerHTML = paymentsHtml;
    } else {
        paymentsContent.innerText = 'No payments found.';
    }
}

async function makePayment() {
    const booking_id = document.getElementById('bookingId').value;
    const amount = document.getElementById('paymentAmount').value;

    if (!booking_id || !amount) {
        alert('Please enter a Booking ID and an Amount.');
        return;
    }

    const res = await fetch(`${BASE_URL}/student/payment`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, amount })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "Payment successful") {
        document.getElementById('bookingId').value = '';
        document.getElementById('paymentAmount').value = '';
        viewPayments();
    }
}

async function makeComplaint() {
    const room_id = document.getElementById('complaintRoomId').value;
    const complaint_text = document.getElementById('complaintText').value;

    if (!complaint_text) {
        alert('Please enter a complaint text.');
        return;
    }

    const res = await fetch(`${BASE_URL}/student/complaint`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id, complaint_text })
    });
    const data = await res.json();
    alert(data.message);
    document.getElementById('complaintText').value = '';
    document.getElementById('complaintRoomId').value = '';
}

async function viewAllRooms() {
    const res = await fetch(`${BASE_URL}/admin/rooms`, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    const roomContent = document.getElementById('roomContent');
    if (!roomContent) return;

    if (data.rooms && data.rooms.length > 0) {
        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Room No</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Occupancy</th>
                        <th>Warden ID</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.rooms.forEach(room => {
            tableHtml += `
                <tr>
                    <td>${room.room_no}</td>
                    <td>${room.type}</td>
                    <td>${room.capacity}</td>
                    <td>${room.current_occupancy}</td>
                    <td>${room.warden_id}</td>
                </tr>
            `;
        });
        tableHtml += `</tbody></table>`;
        roomContent.innerHTML = tableHtml;
    } else {
        roomContent.innerText = 'No rooms found.';
    }
}

async function viewAllComplaints() {
    const res = await fetch(`${BASE_URL}/admin/complaints`, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    const complaintsContent = document.getElementById('complaintsContent');
    if (!complaintsContent) return;

    if (data.complaints && data.complaints.length > 0) {
        let cardsHtml = '<div class="card-container">';
        data.complaints.forEach(complaint => {
            cardsHtml += `
                <div class="card">
                    <p><strong>Student Name:</strong> ${complaint.student_name || 'N/A'}</p>
                    <p><strong>Room No:</strong> ${complaint.room_no || 'N/A'}</p>
                    <p><strong>Complaint:</strong> ${complaint.complaint_text || 'N/A'}</p>
                    <p><strong>Status:</strong> <span class="status ${complaint.status.toLowerCase()}">${complaint.status || 'N/A'}</span></p>
                    <p><strong>Created At:</strong> ${new Date(complaint.created_at).toLocaleDateString()}</p>
                </div>
            `;
        });
        cardsHtml += '</div>';
        complaintsContent.innerHTML = cardsHtml;
    } else {
        complaintsContent.innerText = 'No complaints found.';
    }
}