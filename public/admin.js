document.addEventListener("DOMContentLoaded", () => {
    let adminKey = localStorage.getItem("adminKey") || "";

    const loginSection = document.getElementById("login-section");
    const dashboard = document.getElementById("dashboard");
    const loginForm = document.getElementById("login-form");
    const postForm = document.getElementById("post-update-form");

    if (adminKey) showDashboard();

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        adminKey = document.getElementById("admin-pass").value;
        localStorage.setItem("adminKey", adminKey);
        showDashboard();
    });

    function showDashboard() {
        loginSection.classList.add("hidden");
        dashboard.classList.remove("hidden");
        loadAdminData();
    }

    async function loadAdminData() {
        // Load Updates for deletion
        const resUp = await fetch('/api/updates');
        const updates = await resUp.json();
        document.getElementById("admin-updates-list").innerHTML = updates.map(u => `
            <div class="comment-item admin-item">
                <div>
                    <strong>[${escapeHtml(u.tag)}] ${escapeHtml(u.title)}</strong>
                </div>
                <button class="danger-btn" onclick="deleteUpdate(${u.id})">Delete</button>
            </div>
        `).join('') || "<p>No updates found.</p>";

        // Load Comments for deletion
        const resCom = await fetch('/api/comments');
        const comments = await resCom.json();
        document.getElementById("admin-comments-list").innerHTML = comments.map(c => `
            <div class="comment-item admin-item">
                <div>
                    <strong>${escapeHtml(c.author)}:</strong> ${escapeHtml(c.content)}
                </div>
                <button class="danger-btn" onclick="deleteComment(${c.id})">Delete</button>
            </div>
        `).join('') || "<p>No comments found.</p>";
    }

    // Publish update
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("up-title").value;
        const tag = document.getElementById("up-tag").value;
        const content = document.getElementById("up-content").value;

        const res = await fetch('/api/admin/updates', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-key': adminKey
            },
            body: JSON.stringify({ title, tag, content })
        });

        if (res.ok) {
            postForm.reset();
            loadAdminData();
            alert("Update published!");
        } else {
            alert("Failed to publish. Check your admin key.");
        }
    });

    window.deleteComment = async (id) => {
        if (!confirm("Delete this comment?")) return;
        await fetch(`/api/admin/comments/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-key': adminKey }
        });
        loadAdminData();
    };

    window.deleteUpdate = async (id) => {
        if (!confirm("Delete this update?")) return;
        await fetch(`/api/admin/updates/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-key': adminKey }
        });
        loadAdminData();
    };

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[match]));
    }
});
