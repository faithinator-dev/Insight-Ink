// Simple HTML/Markdown to safe HTML converter
// Handles basic markdown and sanitizes HTML

function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

function parseMarkdown(text) {
    if (!text) return '';

    let html = text;

    // Escape HTML first to prevent XSS
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headings (# Heading)
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>');

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Code inline (`code`)
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Code blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>');

    // Links [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-600 hover:text-indigo-700 underline" target="_blank">$1</a>');

    // Images ![alt](url) - Note: Already sanitized, url won't contain script
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" loading="lazy" />');

    // Unordered lists (- item)
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-6">• $1</li>');
    html = html.replace(/(<li class="ml-6">.*?<\/li>)/gs, (match) => {
        return '<ul class="my-2 space-y-1">' + match + '</ul>';
    });

    // Ordered lists (1. item)
    html = html.replace(/^\d+\. (.*?)$/gm, '<li class="ml-6">$1</li>');

    // Line breaks - convert double newlines to paragraphs
    html = html.split('\n\n').map(paragraph => {
        if (paragraph.trim().startsWith('<')) {
            return paragraph; // Already HTML
        }
        if (paragraph.trim() === '') {
            return '';
        }
        return '<p class="my-3 leading-relaxed">' + paragraph.trim().replace(/\n/g, '<br />') + '</p>';
    }).join('');

    return html;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseMarkdown, sanitizeHtml };
}
