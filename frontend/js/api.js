// API Configuration
const API_BASE = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'API Error');
        }
        
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

// Auth APIs
const authAPI = {
    register: (email, password, username) =>
        apiCall('/auth/register', 'POST', { email, password, username }),
    
    login: (email, password) =>
        apiCall('/auth/login', 'POST', { email, password }),
    
    logout: () =>
        apiCall('/auth/logout', 'POST'),
    
    me: () =>
        apiCall('/auth/me', 'GET')
};

// Posts APIs
const postsAPI = {
    getAll: (page = 1) =>
        apiCall(`/posts?page=${page}`, 'GET'),
    
    getById: (id) =>
        apiCall(`/posts/${id}`, 'GET'),
    
    create: (title, excerpt, content) =>
        apiCall('/posts', 'POST', { title, excerpt, content }),
    
    update: (id, title, excerpt, content) =>
        apiCall(`/posts/${id}`, 'PUT', { title, excerpt, content }),
    
    delete: (id) =>
        apiCall(`/posts/${id}`, 'DELETE'),
    
    like: (id) =>
        apiCall(`/posts/${id}/like`, 'POST'),
    
    comment: (id, text) =>
        apiCall(`/posts/${id}/comment`, 'POST', { text }),
    
    deleteComment: (postId, commentId) =>
        apiCall(`/posts/${postId}/comment/${commentId}`, 'DELETE')
};

// Admin APIs
const adminAPI = {
    deletePost: (id, reason) =>
        apiCall(`/admin/delete-post`, 'POST', { postId: id, reason }),
    
    promoteUser: (userId) =>
        apiCall(`/admin/promote/${userId}`, 'POST'),
    
    sendNotice: (userId, subject, message) =>
        apiCall(`/admin/send-notice`, 'POST', { userId, subject, message }),
    
    getDashboard: () =>
        apiCall('/admin/dashboard', 'GET'),
    
    getUsers: () =>
        apiCall('/admin/users', 'GET'),
    
    getActivity: () =>
        apiCall('/admin/activity', 'GET')
};

// Notifications APIs
const notificationsAPI = {
    getAll: () =>
        apiCall('/notifications', 'GET'),
    
    markAsRead: (id) =>
        apiCall(`/notifications/${id}/read`, 'PUT')
};

// Users APIs
const usersAPI = {
    getProfile: (username) =>
        apiCall(`/users/${username}`, 'GET'),
    
    updateProfile: (data) =>
        apiCall(`/users/profile`, 'PUT', data)
};
