document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem('username');
    if (!username) return window.location.href = '/register';

    const taskButtons = {
        "mine2-btn": { target: 2, reward: 10000 },
        "mine20-btn": { target: 20, reward: 100000 },
        "mine100-btn": { target: 100, reward: 1000000 },
        "refer2-btn": { target: 2, reward: 30000 },
        "refer5-btn": { target: 5, reward: 50000 },
        "refer10-btn": { target: 10, reward: 100000 },
        "follow-btn": { target: 1, reward: 30000 },
        "join-btn": { target: 1, reward: 30000 }
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
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to claim reward');
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Function to fetch the task status to check if it has been claimed
    async function fetchTaskStatus(taskId) {
        try {
            const response = await fetch(`/api/taskStatus/${username}/${taskId}`);
            const data = await response.json();
            return data.claimed;
        } catch (error) {
            console.error('Error fetching task status:', error);
            return false;
        }
    }

    // Function to update the task button based on the user's progress
    async function updateTaskButton(taskId, target, reward, fetchProgress) {
        const button = document.getElementById(taskId);
        const progressCount = await fetchProgress();
        button.textContent = `${progressCount}/${target}`;

        if (await fetchTaskStatus(taskId)) {
            button.disabled = true;
            button.innerHTML = "&#10003;"; // Checked sign
        } else if (progressCount >= target) {
            button.disabled = false;
            button.textContent = "Claim";
            button.addEventListener('click', async () => {
                const success = await claimTask(taskId, reward);
                if (success) {
                    button.disabled = true;
                    button.innerHTML = "&#10003;"; // Checked sign
                    showCustomAlert('Reward claimed successfully!');
                } else {
                    showCustomAlert('Failed to claim reward. Please try again.');
                }
            });
        } else {
            button.disabled = true;
        }
    }

    // Function to handle social media tasks
    function handleSocialMediaTask(taskId, url) {
        const button = document.getElementById(taskId);
        button.addEventListener('click', (event) => {
            if (button.textContent === "Claim") {
                claimSocialMediaTask(taskId);
            } else {
                localStorage.setItem(taskId + '-initiated', 'true');
                window.open(url, '_blank');
            }
        });
    }

    // Function to claim social media task
    async function claimSocialMediaTask(taskId) {
        const button = document.getElementById(taskId);
        const success = await claimTask(taskId, 30000); // Assuming reward is 30000 for both tasks
        if (success) {
            button.disabled = true;
            button.innerHTML = "&#10003;"; // Checked sign
            showCustomAlert('Reward claimed successfully!');
            localStorage.removeItem(taskId + '-initiated');
        } else {
            showCustomAlert('Failed to claim reward. Please try again.');
        }
    }

    // Check if social media tasks were initiated and enable claim if true
    async function checkSocialMediaTask(taskId) {
        const button = document.getElementById(taskId);
        if (localStorage.getItem(taskId + '-initiated') === 'true' && !(await fetchTaskStatus(taskId))) {
            button.disabled = false;
            button.textContent = "Claim";
            button.addEventListener('click', async () => {
                await claimSocialMediaTask(taskId);
            });
        }
    }

    // Function to show the custom alert
    function showCustomAlert(message) {
        const customAlert = document.getElementById('custom-alert');
        const customAlertMessage = document.getElementById('custom-alert-message');
        customAlertMessage.textContent = message;
        customAlert.style.display = 'block';
    }

    // Function to close the custom alert
    window.closeCustomAlert = function() {
        const customAlert = document.getElementById('custom-alert');
        customAlert.style.display = 'none';
    }

    // Update all task buttons
    for (const [taskId, { target, reward }] of Object.entries(taskButtons)) {
        const fetchProgress = taskId.startsWith('refer') ? fetchReferralCount : fetchMiningSessionCount;
        if (taskId === 'follow-btn' || taskId === 'join-btn') {
            const url = taskId === 'follow-btn' ? 'https://twitter.com/softcoin__' : 'https://t.me/softcoinupdates';
            handleSocialMediaTask(taskId, url);
            checkSocialMediaTask(taskId);
        } else {
            updateTaskButton(taskId, target, reward, fetchProgress);
        }
    }
});
