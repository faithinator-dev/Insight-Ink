// Home Page - Posts List
let currentPage = 1;

async function loadPosts(page = 1) {
    const loading = $('#loading');
    const container = $('#posts-container');
    const empty = $('#empty-state');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    empty.style.display = 'none';
    
    try {
        const data = await postsAPI.getAll(page);
        currentPage = page;
        
        if (!data.posts || data.posts.length === 0) {
            empty.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        container.innerHTML = data.posts.map(post => `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">${post.title}</h2>
                        <div class="card-meta">
                            <span>By ${post.author}</span>
                            <span>${formatDate(post.createdAt)}</span>
                            <span>${post.likes?.length || 0} likes</span>
                            <span>${post.comments?.length || 0} comments</span>
                        </div>
                    </div>
                </div>
                <p>${post.excerpt || truncate(post.content, 150)}</p>
                <div style="margin-top: 16px;">
                    <a href="post.html?id=${post._id}" class="btn btn-primary">Read More</a>
                    ${auth.user && (auth.user._id === post.authorId || auth.isAdmin()) ? `
                        <a href="edit.html?id=${post._id}" class="btn btn-secondary">Edit</a>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Pagination
        renderPagination(data.pages || 1, page);
        
    } catch (err) {
        showError('Failed to load posts');
    } finally {
        loading.style.display = 'none';
    }
}

function renderPagination(totalPages, currentPage) {
    const pagination = $('#pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    if (currentPage > 1) {
        pagination.innerHTML += `<button class="btn btn-secondary" onclick="loadPosts(${currentPage - 1})">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            pagination.innerHTML += `<button class="btn" style="background: var(--accent-color); color: white;" disabled>${i}</button>`;
        } else {
            pagination.innerHTML += `<button class="btn btn-secondary" onclick="loadPosts(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        pagination.innerHTML += `<button class="btn btn-secondary" onclick="loadPosts(${currentPage + 1})">Next →</button>`;
    }
}

// Load posts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    
    // Update admin nav visibility
    document.addEventListener('user-loaded', () => {
        const adminNav = document.getElementById('admin-nav');
        if (adminNav) {
            adminNav.style.display = auth.isAdmin() ? '' : 'none';
        }
    });
});
