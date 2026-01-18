// Telegram feed loader
async function loadTelegramFeed() {
    const container = document.getElementById('telegram-posts');
    if (!container) return;

    try {
        const response = await fetch('./posts.json');
        const posts = await response.json();

        if (posts.length === 0) {
            container.innerHTML = '<li>No posts yet</li>';
            return;
        }

        container.innerHTML = posts.map(post => {
            let html = `<li>
                <span class="post-time">${post.time || ''}</span>
                <div class="post-content">${post.html || post.text || ''}</div>`;

            if (post.images && post.images.length > 0) {
                html += '<div class="post-images">';
                post.images.forEach(img => {
                    html += `<img src="${img}" alt="post image" loading="lazy">`;
                });
                html += '</div>';
            }

            if (post.document) {
                html += `<div class="post-document">[${post.document}]</div>`;
            }

            html += '</li>';
            return html;
        }).join('');
    } catch (error) {
        container.innerHTML = '<li>Failed to load feed</li>';
        console.error('Error loading feed:', error);
    }
}
