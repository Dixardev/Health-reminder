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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                // Store the token, username, and _id in localStorage
                localStorage.setItem('token', result.token);
                localStorage.setItem('username', result.username);
                localStorage.setItem('userId', result._id); // Store _id

                alertBox.className = 'custom-alert alert-success';
                alertBox.textContent = 'Login successful!';
                alertBox.style.display = 'block';

                // Redirect to the homepage after login
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000); // Delay for 2 seconds to show the success message
            } else {
                alertBox.className = 'custom-alert alert-danger';
                alertBox.textContent = result.message || 'Login failed!';
                alertBox.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            alertBox.className = 'custom-alert alert-danger';
            alertBox.textContent = 'An error occurred. Please try again.';
            alertBox.style.display = 'block';
        }
    });
});
