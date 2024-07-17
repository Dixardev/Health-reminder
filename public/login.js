document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const alertBox = document.getElementById('alert-box');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const loginData = {
            usernameEmail: formData.get('usernameEmail'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();
            alertBox.textContent = result.message;
            alertBox.className = `custom-alert alert-${response.ok ? 'success' : 'danger'}`;
            alertBox.style.display = 'block';
            if (response.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('username', result.username);
                window.location.href = '/';
            }
        } catch {
            alertBox.textContent = 'An error occurred. Please try again.';
            alertBox.className = 'custom-alert alert-danger';
            alertBox.style.display = 'block';
        }
    });
});
