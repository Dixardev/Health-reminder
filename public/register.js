document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const alertBox = document.getElementById('alert-box');

    const showAlert = (message, type) => {
        alertBox.textContent = message;
        alertBox.className = `custom-alert alert-${type}`;
        alertBox.style.display = 'block';
    };

    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Extract form data
        const fullName = document.getElementById('full-name').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        const referralUsername = document.getElementById('referral-username').value.trim();

        console.log('Form data:', { fullName, username, email, password, confirmPassword, referralUsername });

        // Basic validation
        if (!fullName || !username || !email || !password || !confirmPassword) {
            showAlert('All fields except referral username are required', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        // Construct the payload
        const payload = {
            fullName,
            username,
            email,
            password,
            referralUsername
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Registration successful', 'success');
                window.location.href = '/login'; // Redirect to the login page
            } else {
                showAlert(data.message || 'Registration failed', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('An error occurred during registration', 'danger');
        }
    });
});
