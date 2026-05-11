// Profile Page
async function loadProfile() {
    try {
        // Set profile info
        const user = auth.user;
        const firstLetter = (user.name || user.username || 'U').charAt(0).toUpperCase();
        
        $('#avatar').textContent = firstLetter;
        $('#username').textContent = user.name || user.username || 'User';
        $('#email').textContent = user.email;
        
        const roleBadge = $('#role-badge');
        roleBadge.className = `badge badge-${user.role}`;
        roleBadge.textContent = user.role.toUpperCase();
        
        // Set form values
        $('#name').value = user.name || '';
        $('#bio').value = user.bio || '';
        
        // Show admin link if admin
        if (auth.isAdmin()) {
            $('#admin-link').style.display = '';
        }
        
        // Load user's posts
        loadUserPosts();
    } catch (err) {
        showError('Failed to load profile');
    }
}

async function loadUserPosts() {
    try {
        const data = await postsAPI.getAll();
        const userPosts = data.posts?.filter(p => p.authorId === auth.user._id) || [];
        
        if (userPosts.length === 0) {
            $('#posts-container').innerHTML = '<p class="text-muted">No posts yet</p>';
            return;
        }
        
        $('#posts-container').innerHTML = userPosts.map(post => `
            <div class="card">
                <h3 class="card-title">${post.title}</h3>
                <div class="card-meta">
                    <span>${formatDate(post.createdAt)}</span>
                    <span>${post.likes?.length || 0} likes</span>
                    <span>${post.comments?.length || 0} comments</span>
                </div>
                <div style="margin-top: 16px;">
                    <a href="post.html?id=${post._id}" class="btn btn-primary">View</a>
                    <a href="edit.html?id=${post._id}" class="btn btn-secondary">Edit</a>
                </div>
            </div>
        `).join('');
    } catch (err) {
        showError('Failed to load posts');
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    
    try {
        const name = $('#name').value;
        const bio = $('#bio').value;
        
        await usersAPI.updateProfile({ name, bio });
        showSuccess('Profile updated!');
        
        // Reload profile
        await auth.init();
        loadProfile();
    } catch (err) {
        showError(err.message);
    }
}

function showChangePasswordModal() {
    $('#password-modal').classList.add('active');
}

function closePasswordModal() {
    $('#password-modal').classList.remove('active');
    document.querySelector('#password-modal form').reset();
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const current = $('#current-password').value;
    const newPwd = $('#new-password').value;
    const confirm = $('#confirm-password').value;
    
    if (newPwd !== confirm) {
        showError('Passwords do not match');
        return;
    }
    
    try {
        // TODO: Implement password change API
        showSuccess('Password changed!');
        closePasswordModal();
    } catch (err) {
        showError(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    loadProfile();
});
