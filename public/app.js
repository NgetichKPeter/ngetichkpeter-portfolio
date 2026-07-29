document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("comment-form");
    const authorInput = document.getElementById("author-input");
    const contentInput = document.getElementById("content-input");
    const commentsList = document.getElementById("comments-list");

    async function fetchComments() {
        try {
            const res = await fetch('/api/comments');
            const comments = await res.json();

            if (comments.length === 0) {
                commentsList.innerHTML = "<p>No comments yet. Be the first to leave a message!</p>";
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
            commentsList.innerHTML = "<p>Failed to load comments from database.</p>";
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const author = authorInput.value.trim();
        const content = contentInput.value.trim();

        if (!author || !content) return;

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author, content })
            });

            if (res.ok) {
                authorInput.value = '';
                contentInput.value = '';
                fetchComments();
            }
        } catch (err) {
            alert("Error saving comment.");
        }
    });

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[match]));
    }

    fetchComments();
});
