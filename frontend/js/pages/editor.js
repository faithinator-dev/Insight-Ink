// Editor Page - Write/Edit Posts
const input = $('#markdown-input');
const preview = $('#markdown-preview');
const toggleBtn = $('#toggle-preview');
const form = $('#write-form');

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

// Handle publish/update
async function handlePublish(e) {
    e.preventDefault();
    
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const title = form.querySelector('[name="title"]').value;
    const excerpt = form.querySelector('[name="excerpt"]').value;
    const content = form.querySelector('[name="content"]').value;

    try {
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Publishing...';

        const data = await postsAPI.create(title, excerpt, content);
        showSuccess('Post published successfully!');
        setTimeout(() => {
            window.location.href = `post.html?id=${data._id}`;
        }, 1000);
    } catch (err) {
        showError(err.message);
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Publish';
    }
}

// Check auth
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
    }
});
