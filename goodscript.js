document.addEventListener("DOMContentLoaded", () => {
    let coinBalance = 0;
    const totalCoins = 15000;
    const rewardInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    let timerInterval;

    const username = localStorage.getItem('username');
    if (!username) return window.location.href = '/register';

    const mineBtn = document.getElementById('mine-btn');
    const coinBalanceEl = document.getElementById('coin-balance');
    const statusMessageEl = document.getElementById('status-message');
    const timerEl = document.getElementById('timer');
    const bars = document.querySelectorAll('.bar');

    // Function to start mining
    async function startMining() {
        try {
            const response = await fetch('/api/startMining', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            if (data.miningStartTime) {
                startTimer(data.miningStartTime);
                mineBtn.disabled = true;
                toggleBarsAnimation(true);
                updateStatusMessage("Mining in progress...");
                coinBalance = data.coinBalance;
                updateCoinBalance();
            } else {
                updateStatusMessage(data.message || "Error starting mining");
            }
        } catch (error) {
            updateStatusMessage("Failed to start mining");
        }
    }

    // Function to update the coin balance on the UI
    function updateCoinBalance() {
        coinBalanceEl.textContent = `${coinBalance.toLocaleString()} SFT`;
    }

    // Function to update the status message on the UI
    function updateStatusMessage(message) {
        statusMessageEl.textContent = message;
    }

    // Function to start the timer for the next reward
    function startTimer(miningStartTime) {
        const endTime = new Date(miningStartTime).getTime() + rewardInterval;

        function updateTimer() {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerEl.textContent = "00:00:00";
                updateStatusMessage("Mining complete!");
                toggleBarsAnimation(false);
                mineBtn.disabled = false;
                updateCoinBalanceWithReferralEarnings(); // Update balance with referral earnings after mining complete
            } else {
                const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
                const seconds = Math.floor((remainingTime / 1000) % 60);
                timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                const elapsedTime = rewardInterval - remainingTime;
                const coinsMined = Math.floor((elapsedTime / rewardInterval) * totalCoins);
                coinBalanceEl.textContent = `${(coinBalance + coinsMined).toLocaleString()} SFT`;
            }
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Function to update the mining status
    async function updateMiningStatus() {
        try {
            const response = await fetch('/api/miningStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            if (data.miningStartTime) {
                startTimer(data.miningStartTime);
                coinBalance = data.coinBalance;
                updateCoinBalance();
                mineBtn.disabled = true;
                toggleBarsAnimation(true);
                updateStatusMessage("Mining in progress...");
            } else if (data.miningComplete) {
                coinBalance = data.coinBalance;
                updateCoinBalance();
                updateStatusMessage("Mining complete!");
                mineBtn.disabled = false;
                toggleBarsAnimation(false);
                updateCoinBalanceWithReferralEarnings(); // Update balance with referral earnings after mining complete
            } else {
                coinBalance = data.coinBalance; // Make sure to set coinBalance even if mining not started
                updateCoinBalance();
                updateStatusMessage("Mining not started");
                mineBtn.disabled = false;
                toggleBarsAnimation(false);
            }
        } catch (error) {
            updateStatusMessage("Failed to retrieve mining status");
        }
    }

    // Bars animation control
    function toggleBarsAnimation(active) {
        bars.forEach(bar => {
            bar.style.animationPlayState = active ? 'running' : 'paused';
        });
    }

    // Function to fetch and update balance with referral earnings
    async function updateCoinBalanceWithReferralEarnings() {
        try {
            const response = await fetch(`/api/referrals/${username}`);
            const data = await response.json();
            coinBalance = data.totalEarnings;
            updateCoinBalance();
        } catch (error) {
            updateStatusMessage("Failed to update balance with referral earnings");
        }
    }

    // Event listener for mining button
    mineBtn.addEventListener('click', startMining);

    // Initial setup: Update mining status and balance on page load
    updateMiningStatus();
});
