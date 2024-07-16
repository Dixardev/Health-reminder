// dark-mode.js

document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    console.log('Dark mode loaded:', isDarkMode); // Debugging line
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    // Toggle dark mode on change
    darkModeToggle.addEventListener('change', function() {
        console.log('Dark mode toggled:', this.checked); // Debugging line
        document.body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked);
    });
});
