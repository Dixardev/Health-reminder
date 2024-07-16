document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:3000";
    let timerInterval;
    let userId = localStorage.getItem('userId'); // Get userId from localStorage

    // Function to start mining
    async function startMining() {
        if (!userId) {
            console.error('User ID not found in localStorage');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/mining/start-mining`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId }) // Use userId here
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Mining started:', result.message);
            } else {
                console.error('Error starting mining:', result.message);
            }
        } catch (error) {
            console.error('Error starting mining:', error);
        }
    }

    // Function to check mining status
    async function checkMiningStatus() {
        if (!userId) {
            updateStatusMessage("User not authenticated");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/mining/mining-status/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Example if using JWT
                }
            });

            if (response.ok) {
                const data = await response.json();
                updateCoinBalance(data.coinBalance);
                if (data.isMining) {
                    updateStatusMessage("Mining in progress...");
                    document.getElementById('mine-btn').disabled = true; // Disable the start button
                    startTimer(data.miningStartTime);
                    toggleBarsAnimation(true);
                } else {
                    updateStatusMessage("Mining complete!");
                    document.getElementById('mine-btn').disabled = false; // Enable the start button
                    toggleBarsAnimation(false);
                }
            } else {
                const result = await response.json();
                console.error('Error fetching mining status:', result.message);
                updateStatusMessage("Error fetching mining status");
            }
        } catch (error) {
            console.error('Error fetching mining status:', error);
            updateStatusMessage("Error fetching mining status");
        }
    }

    // Update coin balance on the UI
    function updateCoinBalance(coinBalance) {
        document.getElementById('coin-balance').textContent = `${coinBalance} SFT`;
    }

    // Update status message on the UI
    function updateStatusMessage(message) {
        document.getElementById('status-message').textContent = message;
    }

    // Start the timer
    function startTimer(startTime) {
        const endTime = new Date(startTime).getTime() + (2 * 60 * 60 * 1000);
        const timerElement = document.getElementById('timer');

        function updateTimer() {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "00:00:00";
                checkMiningStatus();
            } else {
                const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
                const seconds = Math.floor((remainingTime / 1000) % 60);
                timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Event listener for mining button
    document.getElementById('mine-btn').addEventListener('click', function() {
        startMining();
    });

    // Bars animation control
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.style.animationPlayState = 'paused'; // Initially paused
    });

    // Function to activate/deactivate bars animation
    function toggleBarsAnimation(active) {
        bars.forEach(bar => {
            bar.style.animationPlayState = active ? 'running' : 'paused';
        });
    }

    // Initial setup
    if (userId) {
        checkMiningStatus();
    } else {
        updateStatusMessage("User not authenticated");
    }
});
