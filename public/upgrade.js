document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem('username');
    if (!username) return window.location.href = '/register';

    try {
        const response = await fetch(`/api/miningStatus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        if (data) {
            const currentLevel = data.level;
            document.getElementById('current-level').innerText = `Current Level: ${currentLevel}`;
            
            const levelOptions = document.querySelectorAll('.level-option');
            levelOptions.forEach(option => {
                const level = parseInt(option.dataset.level);
                if (level <= currentLevel) {
                    option.querySelector('button').disabled = true;
                    option.querySelector('button').innerText = 'Unlocked';
                } else if (level !== currentLevel + 1) {
                    option.querySelector('button').disabled = true;
                }
            });
        }
    } catch (error) {
        showCustomAlert("Failed to fetch user data");
    }

    async function upgradeLevel(level) {
        try {
            const response = await fetch('/api/upgradeLevel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, level })
            });
            const data = await response.json();
            if (data.success) {
                showCustomAlert(`Successfully upgraded to level ${level}`, () => {
                    window.location.href = '/';
                });
            } else {
                showCustomAlert(data.message);
            }
        } catch (error) {
            showCustomAlert("Failed to upgrade level");
        }
    }

    window.upgradeLevel = upgradeLevel;

    function showCustomAlert(message, callback) {
        document.getElementById('custom-alert-message').innerText = message;
        const alertElement = document.getElementById('custom-alert');
        alertElement.style.display = 'flex';
        
        const button = alertElement.querySelector('button');
        button.onclick = () => {
            alertElement.style.display = 'none';
            if (callback) callback();
        };
    }

    function closeCustomAlert() {
        document.getElementById('custom-alert').style.display = 'none';
    }

    window.showCustomAlert = showCustomAlert;
    window.closeCustomAlert = closeCustomAlert;
});
