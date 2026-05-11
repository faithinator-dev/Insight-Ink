// Edit Page - Edit existing post
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
let post = null;

const input = $('#markdown-input');
const preview = $('#markdown-preview');
const toggleBtn = $('#toggle-preview');
const form = $('#edit-form');

async function loadPost() {
    try {
        post = await postsAPI.getById(postId);
        
        // Check authorization
        if (!auth.isAuthenticated() || (auth.user._id !== post.authorId && !auth.isSuperAdmin())) {
            showError('You are not authorized to edit this post');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }

        form.querySelector('[name="title"]').value = post.title;
        form.querySelector('[name="excerpt"]').value = post.excerpt;
        form.querySelector('[name="content"]').value = post.content;
        
        $('#cancel-btn').href = `post.html?id=${postId}`;
        updatePreview();
    } catch (err) {
        showError('Failed to load post');
    }
}

// Helper to insert markdown
function insertMarkdown(before, after = '') {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = input.value.substring(start, end) || 'text';
    const beforeSelection = input.value.substring(0, start);
    const afterSelection = input.value.substring(end);
    
    input.value = beforeSelection + before + selectedText + after + afterSelection;
    input.focus();
    
    updatePreview();
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function updatePreview() {
    preview.innerHTML = marked.parse(input.value);
}

// Toolbar buttons
document.getElementById('btn-bold').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('**', '**');
});

document.getElementById('btn-italic').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('*', '*');
});

document.getElementById('btn-underline').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('<u>', '</u>');
});

document.getElementById('btn-strikethrough').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('~~', '~~');
});

document.getElementById('btn-h1').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('# ', '');
});

document.getElementById('btn-h2').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('## ', '');
});

document.getElementById('btn-h3').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('### ', '');
});

document.getElementById('btn-list').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('- ', '');
});

document.getElementById('btn-olist').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('1. ', '');
});

document.getElementById('btn-quote').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('> ', '');
});

document.getElementById('btn-code').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('```\n', '\n```');
});

document.getElementById('btn-link').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('[Link text](', ')');
});

document.getElementById('btn-image').addEventListener('click', (e) => {
    e.preventDefault();
    insertMarkdown('![Alt text](', ')');
});

// Keyboard shortcuts
input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**');
    }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*');
    }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        insertMarkdown('<u>', '</u>');
    }
    else if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        insertMarkdown('\n', '');
    }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        insertMarkdown('\n\n', '');
    }
});

// Real-time preview
input.addEventListener('input', updatePreview);

// Toggle preview
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    preview.style.display = preview.style.display === 'none' ? '' : 'none';
    input.style.display = input.style.display === 'none' ? '' : 'none';
    toggleBtn.textContent = preview.style.display === 'none' ? 'Preview' : 'Edit';
});

// Handle update
async function handleUpdate(e) {
    e.preventDefault();
    
    const title = form.querySelector('[name="title"]').value;
    const excerpt = form.querySelector('[name="excerpt"]').value;
    const content = form.querySelector('[name="content"]').value;

    try {
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Updating...';

        await postsAPI.update(postId, title, excerpt, content);
        showSuccess('Post updated successfully!');
        setTimeout(() => {
            window.location.href = `post.html?id=${postId}`;
        }, 1000);
    } catch (err) {
        showError(err.message);
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Update';
    }
}

// Check auth and load post
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    loadPost();
});
