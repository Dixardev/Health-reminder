document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem('username');
    if (!username) return window.location.href = '/register';

    const taskButtons = {
        "mine2-btn": { target: 2, reward: 10000 },
        "mine20-btn": { target: 20, reward: 100000 },
        "mine100-btn": { target: 100, reward: 1000000 },
        "refer2-btn": { target: 2, reward: 30000 },
        "refer5-btn": { target: 5, reward: 50000 },
        "refer10-btn": { target: 10, reward: 100000 }
    };

    // Function to fetch user referral count
    async function fetchReferralCount() {
        try {
            const response = await fetch(`/api/referrals/${username}`);
            const data = await response.json();
            return data.referrals.length || 0;
        } catch (error) {
            console.error('Error fetching referral count:', error);
            return 0;
        }
    }

    // Function to fetch user mining session count
    async function fetchMiningSessionCount() {
        try {
            const response = await fetch(`/api/miningSessionCount/${username}`);
            const data = await response.json();
            return data.miningSessionCount || 0;
        } catch (error) {
            console.error('Error fetching mining session count:', error);
            return 0;
        }
    }

    // Function to update the user's SFT balance and mark task as claimed
    async function claimTask(taskId, reward) {
        try {
            const response = await fetch(`/api/claimTask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, taskId, reward })
            });
            return response.ok;
        } catch (error) {
            console.error('Error claiming task:', error);
            return false;
        }
    }

    // Function to update the task button based on the user's progress
    async function updateTaskButton(taskId, target, reward, fetchProgress) {
        const button = document.getElementById(taskId);
        const progressCount = await fetchProgress();
        button.textContent = `${progressCount}/${target}`;

        if (progressCount >= target) {
            button.disabled = false;
            button.textContent = "Claim";
            button.addEventListener('click', async () => {
                const success = await claimTask(taskId, reward);
                if (success) {
                    button.disabled = true;
                    button.innerHTML = "&#10003;"; // Checked sign
                } else {
                    alert('Failed to claim reward. Please try again.');
                }
            });
        }
    }

    // Update all task buttons
    for (const [taskId, { target, reward }] of Object.entries(taskButtons)) {
        const fetchProgress = taskId.startsWith('refer') ? fetchReferralCount : fetchMiningSessionCount;
        updateTaskButton(taskId, target, reward, fetchProgress);
    }
});
