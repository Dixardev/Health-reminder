document.addEventListener("DOMContentLoaded", () => {
    let coinBalance = 0;
    let coinsMined = 0;
    const totalCoins = 15000;
    const rewardInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const incrementInterval = rewardInterval / totalCoins; // Time interval to increment 1 coin
    let timerInterval;
    let miningInterval;

    // Function to mine coins gradually
    function startMining() {
        coinsMined = 0;
        updateStatusMessage("Mining in progress...");
        toggleBarsAnimation(true); // Activate bars animation
        miningInterval = setInterval(() => {
            coinsMined++;
            coinBalance++;
            updateCoinBalance();
            if (coinsMined >= totalCoins) {
                clearInterval(miningInterval);
                updateStatusMessage("Mining complete! SFT added to balance.");
                toggleBarsAnimation(false); // Deactivate bars animation
                document.getElementById('mine-btn').disabled = false; // Enable the button after mining
                startTimer(); // Start the next mining cycle
            }
        }, incrementInterval);
    }

    // Function to update coin balance on the UI
    function updateCoinBalance() {
        document.getElementById('coin-balance').textContent = `${coinBalance} SFT`;
    }

    // Function to update status message on the UI
    function updateStatusMessage(message) {
        document.getElementById('status-message').textContent = message;
    }

    // Function to start the game
    function startGame() {
        updateStatusMessage("Mining started");
        document.getElementById('mine-btn').disabled = true; // Disable the button after starting
        startMining();
        startTimer();
    }

    // Function to start the timer for the next reward
    function startTimer() {
        const endTime = Date.now() + rewardInterval;
        const timerElement = document.getElementById('timer');

        function updateTimer() {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "00:00:00";
                startMining(); // Restart mining after the timer ends
            } else {
                const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
                const seconds = Math.floor((remainingTime / 1000) % 60);
                timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }

        updateTimer(); // Update immediately to show the starting time
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Event listener for mining button
    document.getElementById('mine-btn').addEventListener('click', function() {
        startGame();
    });

    // Initial setup
    updateCoinBalance();
    updateStatusMessage("Game not started");

    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
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

    // Disable bars animation initially
    toggleBarsAnimation(false);
});
