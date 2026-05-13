// Post Page - View single post with comments
let post = null;
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

async function loadPost() {
    if (!postId) {
        window.location.href = 'index.html';
        return;
    }

    const loading = $('#loading');
    const content = $('#post-content');

    loading.style.display = 'block';

    try {
        post = await postsAPI.getById(postId);

        // Set title
        $('#post-title').textContent = post.title;

        // Set metadata
        $('#post-meta').innerHTML = `
            <span>By <strong>${post.author}</strong></span>
            <span>${formatDate(post.createdAt)}</span>
            <span id="like-count">${post.likes?.length || 0} likes</span>
            <span id="comment-count">${post.comments?.length || 0} comments</span>
        `;

        // Set body
        $('#post-body').innerHTML = marked.parse(post.content);

        // Like button
        const likeBtn = $('#like-btn');
        const isLiked = post.likes?.includes(auth.user?._id);
        likeBtn.textContent = isLiked ? '❤️ Unlike' : '❤️ Like';
        likeBtn.onclick = handleLike;

        // Edit actions
        if (auth.user && (auth.user._id === post.authorId || auth.isSuperAdmin())) {
            $('#edit-actions').innerHTML = `
                <a href="edit.html?id=${post._id}" class="btn btn-secondary">Edit</a>
                <button onclick="deletePost()" class="btn btn-danger">Delete</button>
            `;
        }

        // Load comments
        renderComments();

        // Hide comment form if not authenticated
        if (!auth.isAuthenticated()) {
            $('#comment-form').style.display = 'none';
        }

    } catch (err) {
        showError('Failed to load post');
    } finally {
        loading.style.display = 'none';
    }
}

async function handleLike() {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        await postsAPI.like(postId);
        await loadPost();
        showSuccess('Post liked!');
    } catch (err) {
        showError(err.message);
    }
}

async function handleComment(e) {
    e.preventDefault();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const text = $('#comment-text').value;
    
    try {
        await postsAPI.comment(postId, text);
        $('#comment-text').value = '';
        await loadPost();
        showSuccess('Comment posted!');
    } catch (err) {
        showError(err.message);
    }
}

function renderComments() {
    const container = $('#comments-container');
    
    if (!post.comments || post.comments.length === 0) {
        container.innerHTML = '<p class="text-muted">No comments yet. Be the first!</p>';
        return;
    }

    container.innerHTML = post.comments.map(comment => `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>${comment.author}</strong>
                    <div class="text-muted" style="font-size: 0.85rem;">${formatDate(comment.createdAt)}</div>
                </div>
                ${auth.user && (auth.user._id === comment.authorId || auth.isSuperAdmin()) ? `
                    <button onclick="deleteComment('${comment._id}')" class="btn btn-danger" style="padding: 4px 8px; font-size: 0.85rem;">Delete</button>
                ` : ''}
            </div>
            <p style="margin-top: 10px;">${comment.text}</p>
        </div>
    `).join('');

    $('#comment-count').textContent = post.comments.length + ' comments';
}

async function deletePost() {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        await postsAPI.delete(postId);
        showSuccess('Post deleted!');
        setTimeout(() => window.location.href = 'index.html', 1000);
    } catch (err) {
        showError(err.message);
    }
}

async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        await postsAPI.deleteComment(postId, commentId);
        showSuccess('Comment deleted!');
        await loadPost();
    } catch (err) {
        showError(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPost();
});
