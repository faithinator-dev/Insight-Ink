// Admin Dashboard Page
let dashboard = null;

async function loadDashboard() {
    try {
        dashboard = await adminAPI.getDashboard();
        
        // Update stats
        $('#total-users').textContent = dashboard.totalUsers || 0;
        $('#total-posts').textContent = dashboard.totalPosts || 0;
        $('#total-admins').textContent = dashboard.totalAdmins || 0;
        
        // Load users
        loadUsers();
        
        // Load notices
        loadNotices();
    } catch (err) {
        showError('Failed to load dashboard');
    }
}

async function loadUsers() {
    try {
        const data = await adminAPI.getUsers();
        const users = data.users || [];
        
        // Update recipient dropdown
        const select = $('#recipient');
        select.innerHTML = '<option value="">-- Select User --</option>';
        users.forEach(user => {
            select.innerHTML += `<option value="${user._id}">${user.username || user.email}</option>`;
        });
        
        // Render users list
        $('#users-container').innerHTML = users.map(user => `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong>${user.username || user.email}</strong>
                        <p class="text-muted" style="font-size: 0.85rem; margin-top: 5px;">${user.email}</p>
                        <span class="badge badge-${user.role}" style="margin-top: 8px;">${user.role.toUpperCase()}</span>
                    </div>
                    ${user.role !== 'superadmin' ? `
                        <button onclick="promoteUser('${user._id}')" class="btn btn-primary" style="padding: 4px 12px; font-size: 0.85rem;">Promote</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (err) {
        showError('Failed to load users');
    }
}

async function loadNotices() {
    try {
        // In a real backend, you'd fetch sent notices from an endpoint
        // For now, we'll keep it empty or show a message
        $('#notices-container').innerHTML = '<p class="text-muted">No notices sent yet</p>';
    } catch (err) {
        showError('Failed to load notices');
    }
}

async function promoteUser(userId) {
    if (!confirm('Are you sure you want to promote this user to admin?')) return;
    
    try {
        await adminAPI.promoteUser(userId);
        showSuccess('User promoted to admin!');
        loadDashboard();
    } catch (err) {
        showError(err.message);
    }
}

async function handleSendNotice(e) {
    e.preventDefault();
    
    const userId = $('#recipient').value;
    const subject = $('#subject').value;
    const message = $('#message').value;
    
    if (!userId) {
        showError('Please select a recipient');
        return;
    }
    
    try {
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Sending...';
        
        await adminAPI.sendNotice(userId, subject, message);
        
        showSuccess('Notice sent successfully!');
        e.target.reset();
        
        btn.disabled = false;
        btn.textContent = 'Send Notice';
        
        loadNotices();
    } catch (err) {
        showError(err.message);
        const btn = e.target.querySelector('button');
        btn.disabled = false;
        btn.textContent = 'Send Notice';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated() || !auth.isAdmin()) {
        showError('Access denied');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }
    loadDashboard();
});
