document.addEventListener("DOMContentLoaded", () => {
    const tasks = [
        { id: "follow-btn", text: "Follow Softcoin on X", reward: 30000, url: "https://twitter.com/softcoin" },
        { id: "join-btn", text: "Join Telegram Channel", reward: 30000, url: "https://t.me/softcoin" },
        { id: "refer2-btn", text: "Refer 2 friends", reward: 30000, type: "count", count: 2 },
        { id: "refer5-btn", text: "Refer 5 friends", reward: 50000, type: "count", count: 5 },
        { id: "refer10-btn", text: "Refer 10 friends", reward: 100000, type: "count", count: 10 },
        { id: "mine2-btn", text: "Complete 2 mining sessions", reward: 10000, type: "count", count: 2 },
        { id: "mine20-btn", text: "Complete 20 mining sessions", reward: 100000, type: "count", count: 20 },
        { id: "mine100-btn", text: "Complete 100 mining sessions", reward: 1000000, type: "count", count: 100 }
    ];

    const checkinRewards = [5000, 7000, 10000, 12000, 15000, 17000, 25000];
    const checkinButton = document.getElementById("daily-check-in-btn");

    let checkinDay = localStorage.getItem("checkinDay") || 0;
    let lastCheckin = localStorage.getItem("lastCheckin");

    const currentDate = new Date().toDateString();
    if (lastCheckin !== currentDate) {
        checkinButton.disabled = false;
        checkinButton.textContent = "Claim";
    } else {
        checkinButton.disabled = true;
        checkinButton.textContent = "✓";
    }

    checkinButton.addEventListener("click", () => {
        if (lastCheckin !== currentDate) {
            addToBalance(checkinRewards[checkinDay]);
            checkinDay = (checkinDay + 1) % checkinRewards.length;
            localStorage.setItem("checkinDay", checkinDay);
            localStorage.setItem("lastCheckin", currentDate);
            checkinButton.disabled = true;
            checkinButton.textContent = "✓";
        }
    });

    tasks.forEach(task => {
        const button = document.getElementById(task.id);

        if (task.type === "count") {
            let progress = localStorage.getItem(task.id) || 0;
            button.textContent = `${progress}/${task.count}`;
            if (progress >= task.count) {
                button.disabled = false;
                button.textContent = "Claim";
            }
        } else {
            if (localStorage.getItem(task.id) === "completed") {
                button.textContent = "✓";
                button.disabled = true;
            } else if (localStorage.getItem(task.id) === "visited") {
                button.textContent = "Claim";
                button.addEventListener("click", () => {
                    addToBalance(task.reward);
                    button.textContent = "✓";
                    button.disabled = true;
                    localStorage.setItem(task.id, "completed");
                });
            } else {
                button.addEventListener("click", () => {
                    window.open(task.url, "_blank");
                    localStorage.setItem(task.id, "visited");
                    button.textContent = "Claim";
                    button.addEventListener("click", () => {
                        addToBalance(task.reward);
                        button.textContent = "✓";
                        button.disabled = true;
                        localStorage.setItem(task.id, "completed");
                    });
                });
            }
        }

        if (task.type === "count") {
            const checkProgress = () => {
                let progress = parseInt(localStorage.getItem(task.id) || 0);
                button.textContent = `${progress}/${task.count}`;
                if (progress >= task.count) {
                    button.disabled = false;
                    button.textContent = "Claim";
                    button.addEventListener("click", () => {
                        addToBalance(task.reward);
                        button.textContent = "✓";
                        button.disabled = true;
                        localStorage.setItem(task.id, "completed");
                    });
                }
            };
            checkProgress();
        }
    });

    function addToBalance(amount) {
        let balance = parseInt(localStorage.getItem("balance") || 0);
        balance += amount;
        localStorage.setItem("balance", balance);
        alert(`Added ${amount} SFT to your balance!`);
    }
    async function updateMiningSessionCount() {
        try {
            const response = await fetch(`/api/miningSessionCount/${username}`);
            const data = await response.json();
            // Update the UI with the mining session count
            document.getElementById('mining-session-count').textContent = `Mining Sessions: ${data.miningSessionCount}`;
        } catch (error) {
            console.error('Failed to update mining session count', error);
        }
    }

    // Call this function in your initial setup
    updateMiningSessionCount();
});
    
