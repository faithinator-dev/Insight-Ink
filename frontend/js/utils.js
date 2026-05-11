// Utility Functions

// Local Storage Management
const Storage = {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear()
};

// Session/Auth State
const auth = {
    user: null,
    
    async init() {
        try {
            this.user = await authAPI.me();
            this.updateUI();
            return this.user;
        } catch (err) {
            this.logout();
        }
    },
    
    async login(email, password) {
        try {
            await authAPI.login(email, password);
            await this.init();
            window.location.href = 'index.html';
        } catch (err) {
            showError(err.message);
        }
    },
    
    async register(email, password, username) {
        try {
            await authAPI.register(email, password, username);
            await this.init();
            window.location.href = 'index.html';
        } catch (err) {
            showError(err.message);
        }
    },
    
    async logout() {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error(err);
        }
        this.user = null;
        this.updateUI();
        window.location.href = 'index.html';
    },
    
    updateUI() {
        const authNav = document.getElementById('auth-nav');
        const userNav = document.getElementById('user-nav');
        
        if (!authNav || !userNav) return;
        
        if (this.user) {
            authNav.style.display = 'none';
            userNav.style.display = 'flex';
            document.getElementById('user-display').textContent = this.user.username || this.user.email;
        } else {
            authNav.style.display = 'flex';
            userNav.style.display = 'none';
        }
    },
    
    isAuthenticated() {
        return this.user !== null;
    },
    
    isSuperAdmin() {
        return this.user && this.user.role === 'superadmin';
    },
    
    isAdmin() {
        return this.user && (this.user.role === 'admin' || this.user.role === 'superadmin');
    }
};

// Notifications & Alerts
function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'error');
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// DOM Helpers
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function show(selector) {
    $(selector).style.display = '';
}

function hide(selector) {
    $(selector).style.display = 'none';
}

function html(selector, content) {
    $(selector).innerHTML = content;
}

function text(selector, content) {
    $(selector).textContent = content;
}

// Format Utilities
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncate(text, length = 100) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Markdown to HTML (simple)
function markdownToHtml(markdown) {
    let html = markdown
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/<u>(.+?)<\/u>/g, '<u>$1</u>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/gm, '<p>')
        .replace(/$/gm, '</p>')
        .replace(/<p><\/p>/g, '');
    
    return html;
}

// Check Auth on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    
    // Add global styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
