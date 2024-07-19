
    inviteButton.addEventListener('click', () => {
        const referralLink = 'https://www.softcoin.world/register.html?ref=' + localStorage.getItem('username');
        navigator.clipboard.writeText(referralLink).then(() => {
            showAlert('Referral link copied to clipboard!', 'success');
        }).catch(err => {
            showAlert('Failed to copy referral link', 'danger');
            console.error('Error:', err);
        });
    });

    fetchFriends();
}

function fetchFriends() {
    const updateFriendsList = (friends) => {
        const friendsList = document.getElementById('friends-list');
        const friendsCount = document.getElementById('friends-count');
        const totalEarnings = friends.reduce((acc, friend) => acc + friend.earned, 0);

        friendsCount.textContent = `You have ${friends.length} friends`;
        document.querySelector('.earnings').textContent = `${totalEarnings} SFT`;

        friendsList.innerHTML = '';
        friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend';
            friendItem.innerHTML = `<span>${friend.username}</span><span>${friend.earned} SFT</span>`;
            friendsList.appendChild(friendItem);
        });
    };

    const username = localStorage.getItem('username');
    fetch(`/api/referrals?username=${username}`)
        .then(response => response.json())
        .then(friends => updateFriendsList(friends))
        .catch(error => console.error('Error fetching friends:', error));
}
