document.addEventListener("DOMContentLoaded", () => {
    const updatesFeed = document.getElementById("updates-feed");
    const commentsList = document.getElementById("comments-list");
    const commentForm = document.getElementById("comment-form");

    // Fetch Updates Feed from DB
    async function fetchUpdates() {
        try {
            const res = await fetch('/api/updates');
            if (!res.ok) throw new Error("Network response was not ok");
            const updates = await res.json();

            if (updates.length === 0) {
                updatesFeed.innerHTML = "<p style='color: var(--muted);'>No updates posted yet.</p>";
                return;
            }

            updatesFeed.innerHTML = updates.map(u => `
                <div class="update-card">
                    <div class="update-meta">
                        <span class="update-tag">${escapeHtml(u.tag)}</span>
                        <span class="update-date">${new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3>${escapeHtml(u.title)}</h3>
                    <p>${escapeHtml(u.content)}</p>
                </div>
            `).join('');
        } catch (err) {
            updatesFeed.innerHTML = "<p style='color: #ef4444;'>Error loading feed.</p>";
        }
    }

    // Fetch General Comments from DB
    async function fetchComments() {
        try {
            const res = await fetch('/api/comments');
            if (!res.ok) throw new Error("Network response was not ok");
            const comments = await res.json();

            if (comments.length === 0) {
                commentsList.innerHTML = "<p style='color: var(--muted);'>No comments yet.</p>";
                return;
            }

            commentsList.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <strong>${escapeHtml(c.author)}</strong>
                    <small>${new Date(c.created_at).toLocaleDateString()}</small>
                    <p style="margin-top: 4px;">${escapeHtml(c.content)}</p>
                </div>
            `).join('');
        } catch (err) {
            commentsList.innerHTML = "<p style='color: #ef4444;'>Error loading comments.</p>";
        }
    }

    // Submit Public Comment
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const author = document.getElementById("author-input").value.trim();
        const content = document.getElementById("content-input").value.trim();

        if (!author || !content) return;

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author, content })
            });

            if (res.ok) {
                commentForm.reset();
                fetchComments();
            }
        } catch (err) {
            alert("Error posting comment.");
        }
    });

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[match]));
    }

    fetchUpdates();
    fetchComments();
});
