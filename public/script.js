document.addEventListener("DOMContentLoaded", () => {
    let coinBalance = 0;
    const rewardInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    let timerInterval;

    async function startGame() {
        const username = localStorage.getItem('username');
        const response = await fetch('/api/startMining', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            const data = await response.json();
            updateStatusMessage(data.message);
            document.getElementById('mine-btn').disabled = true; // Disable the button after starting
            if (data.miningStartTime) {
                const miningStartTime = new Date(data.miningStartTime);
                console.log(`Mining started at: ${miningStartTime}`);
                startTimer(miningStartTime);
            }
            toggleBarsAnimation(true); // Activate bars animation
            checkMiningStatus();
        } else {
            const error = await response.json();
            updateStatusMessage(error.message);
        }
    }

    async function checkMiningStatus() {
        const username = localStorage.getItem('username');
        const response = await fetch('/api/miningStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            const data = await response.json();
            coinBalance = data.coinBalance;
            updateCoinBalance();
            updateStatusMessage(data.message);

            if (data.message === 'Mining complete') {
                document.getElementById('mine-btn').disabled = false; // Enable the button after mining
                clearInterval(timerInterval);
                toggleBarsAnimation(false); // Deactivate bars animation
            } else {
                document.getElementById('mine-btn').disabled = true;
                if (data.miningStartTime) {
                    const miningStartTime = new Date(data.miningStartTime);
                    console.log(`Resumed mining started at: ${miningStartTime}`);
                    startTimer(miningStartTime);
                }
                toggleBarsAnimation(true); // Ensure bars animation is active
                setTimeout(checkMiningStatus, 1000); // Check status every second
            }
        } else {
            const error = await response.json();
            updateStatusMessage(error.message);
        }
    }

    function startTimer(startTime) {
        const endTime = startTime.getTime() + rewardInterval;
        const timerElement = document.getElementById('timer');

        function updateTimer() {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "00:00:00";
                updateStatusMessage("Mining complete!");
                document.getElementById('mine-btn').disabled = false;
                toggleBarsAnimation(false); // Deactivate bars animation
            } else {
                const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
                const seconds = Math.floor((remainingTime / 1000) % 60);
                timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                console.log(`Timer update: ${timerElement.textContent}`);
            }
        }

        updateTimer(); // Update immediately to show the starting time
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateCoinBalance() {
        document.getElementById('coin-balance').textContent = `${coinBalance} SFT`;
    }

    function updateStatusMessage(message) {
        document.getElementById('status-message').textContent = message;
    }

    // Bars animation control
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.style.animationPlayState = 'paused'; // Initially paused
    });

    function toggleBarsAnimation(active) {
        bars.forEach(bar => {
            bar.style.animationPlayState = active ? 'running' : 'paused';
        });
    }

    // Event listener for mining button
    document.getElementById('mine-btn').addEventListener('click', startGame);

    // Initial setup
    checkMiningStatus();
    updateCoinBalance();
    updateStatusMessage("Mining not started");
});
