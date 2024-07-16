document.addEventListener("DOMContentLoaded", () => {
    let coinBalance = 0;
    const totalCoins = 15000;
    const rewardInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    let timerInterval;
    let miningInterval;

    // Function to start mining
    async function startMining() {
        const username = localStorage.getItem('username');
        if (!username) return;

        const response = await fetch('/api/startMining', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (data.miningStartTime) {
            startTimer(data.miningStartTime);
            document.getElementById('mine-btn').disabled = true; // Disable the button after starting
            toggleBarsAnimation(true); // Activate bars animation
            updateStatusMessage("Mining in progress...");
            coinBalance = data.coinBalance;
            document.getElementById('coin-balance').textContent = `${coinBalance} SFT`;
        }
    }

    // Function to update the coin balance on the UI
    function updateCoinBalance() {
        document.getElementById('coin-balance').textContent = `${coinBalance} SFT`;
    }

    // Function to update the status message on the UI
    function updateStatusMessage(message) {
        document.getElementById('status-message').textContent = message;
    }

    // Function to start the timer for the next reward
    function startTimer(miningStartTime) {
        const endTime = new Date(miningStartTime).getTime() + rewardInterval;
        const timerElement = document.getElementById('timer');

        function updateTimer() {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "00:00:00";
                updateStatusMessage("Mining complete!");
                toggleBarsAnimation(false); // Deactivate bars animation
                document.getElementById('mine-btn').disabled = false; // Enable the button after mining
            } else {
                const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
                const seconds = Math.floor((remainingTime / 1000) % 60);
                timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                // Calculate and update the coin balance
                const elapsedTime = rewardInterval - remainingTime;
                const coinsMined = Math.floor((elapsedTime / rewardInterval) * totalCoins);
                coinBalance += coinsMined - coinBalance; // Update only the mined coins
                updateCoinBalance();
            }
        }

        updateTimer(); // Update immediately to show the starting time
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Function to update the mining status
    async function updateMiningStatus() {
        const username = localStorage.getItem('username');
        if (!username) return;

        const response = await fetch('/api/miningStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (data.miningStartTime) {
            startTimer(data.miningStartTime);
            coinBalance = data.coinBalance;
            document.getElementById('coin-balance').textContent = `${coinBalance} SFT`;
            document.getElementById('mine-btn').disabled = true; // Disable the button if mining is ongoing
            toggleBarsAnimation(true); // Activate bars animation if mining is ongoing
        } else {
            updateStatusMessage("Mining not started");
            document.getElementById('mine-btn').disabled = false; // Enable the button if mining is not ongoing
            toggleBarsAnimation(false); // Deactivate bars animation if mining is not ongoing
        }

        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = data.message;
    }

    // Event listener for mining button
    document.getElementById('mine-btn').addEventListener('click', function() {
        startMining();
    });

    // Initial setup
    updateMiningStatus();

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
});
