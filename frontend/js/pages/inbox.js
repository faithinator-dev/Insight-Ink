// Inbox Page - Notifications
async function loadNotifications() {
    const loading = $('#loading');
    const container = $('#notifications-container');
    const empty = $('#empty-state');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    empty.style.display = 'none';
    
    try {
        const data = await notificationsAPI.getAll();
        const notifications = data.notifications || [];
        
        if (notifications.length === 0) {
            empty.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        const unreadCount = notifications.filter(n => !n.read).length;
        $('#unread-count').textContent = unreadCount;
        
        container.innerHTML = notifications.map(notif => `
            <div class="card" style="${notif.read ? 'opacity: 0.7;' : 'border-left: 4px solid var(--accent-color);'}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin-bottom: 5px;">${notif.subject || notif.title || 'Notification'}</h3>
                        <p style="margin-bottom: 10px;">${notif.message || notif.content || ''}</p>
                        <div class="text-muted" style="font-size: 0.85rem;">
                            <span>${formatDate(notif.createdAt)}</span>
                            <span style="margin-left: 15px;">Type: <strong>${notif.type}</strong></span>
                        </div>
                    </div>
                    ${!notif.read ? `
                        <button onclick="markAsRead('${notif._id}')" class="btn btn-primary" style="padding: 4px 12px; font-size: 0.85rem;">Mark Read</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        showError('Failed to load notifications');
    } finally {
        loading.style.display = 'none';
    }
}

async function markAsRead(notificationId) {
    try {
        await notificationsAPI.markAsRead(notificationId);
        loadNotifications();
        showSuccess('Marked as read');
    } catch (err) {
        showError(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    loadNotifications();
    
    // Refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);
});
