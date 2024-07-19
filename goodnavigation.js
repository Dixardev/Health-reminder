// navigation.js
document.addEventListener("DOMContentLoaded", () => {
    // Example event listener for navigation items
    const navItems = document.querySelectorAll('#bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            console.log(`Navigating to ${item.querySelector('span').textContent}`);
            // Add your navigation logic here
        });
    });

    // Function to load the navigation menu
    function loadNavMenu() {
        fetch("nav.html")
            .then(response => response.text())
            .then(data => {
                document.getElementById("nav-placeholder").innerHTML = data;
                highlightActiveNavItem();
            })
            .catch(error => console.error('Error loading navigation menu:', error));
    }

    function highlightActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll("#bottom-nav .nav-item");
        navItems.forEach(item => {
            const href = item.getAttribute("href");
            if (href === currentPath) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }

    loadNavMenu();
});
