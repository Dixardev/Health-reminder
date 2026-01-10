document.addEventListener("DOMContentLoaded", () => {
    fetch('cherry.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('cherry-placeholder').innerHTML = data;

            const cherryLogo = document.getElementById('cherry-logo');
            const cherryModal = document.getElementById('cherry-modal');
            const cherryMessage = document.getElementById('cherry-message');
            const cherryClose = document.getElementsByClassName('cherry-close')[0];
            let conversationIndex = 0;

            const messages = [
                `Hello,<br><br><b>Welcome to Softcoin!</b><br><br>Will you like a tour?<br><br>`,
                `Alright.<br><br>If you need assistance with anything, simply click on the logo at the top left corner of the screen, we will be ready to assist in any way we can.<br><br>Happy mining!<br><br>`,
                `Great! Let's begin.<br><br><b>What is Softcoin?</b><br><br>Softcoin is an Innovative crypto airdrop project with a vision to enrich and enhance the lives of all its participant.<br><br>We are very particular about listing on major exchange platforms, at a valuable rate.<br><br>On this journey, we are going to need all the help we can get, and your participation in all our programs will be instrumemtal to the success of the project<br><br>`,
                `<b>How To Mine Softcoin</b><br><br>It is very easy to mine Softcoin, all you need to do is click the 'Start Mining' button to kickstart a mining session that will last for 2 hours (in level 1).<br><br>You get 15,000 SFT for each mining session, and when a session end, simply click the 'Start Mining' button again to start a new session.<br><br>`,
                `<b>Level Upgrades</b><br><br>Increase your mining power by upgrading your mining level. pay a token from your SFT balance and get promoted to the next level.<br><br>The  higher you go, and the bigger your reward, and the longer your mining sessions.<br><br>`,
                `<b>Friends and Referral Bonuses</b><br><br>The best way to get as much coin as you can is by inviting your friends to join Softcoin through your referral link.<br><br>You will get 50,000 SFT for each friend you successfully invite. Your invited friend will also get get 50,000 coin for registering through your referral link.<br><br>Additionally, you get a passive 20% share of your friends earnings.<br><br>Click on "Friends" on the navigation menu below the screen to see your referral activities, and to copy your referral link.<br>`,
                `<b>Tasks</b><br><br>You can earn more coin by completing tasks.<br><br>When you complete a task, you get rewarded with SFT. Claim your reward, and it will be added to your earnings.<br><br>You also get a reward for checking-in daily. When you keep a check-in streak, your reward increases.<br><br>`,
                `<b>Softie</b><br><br>Softies are premium users, more like stakeholders.<br><br>To become a Softie, you need to make a commitment, and in return you get a certain percentage of your commitment payed into your account everyday.<br><br>Benefit of Softie:<br><br>1. You get paid in USDT every day.<br><br>2. You can withdraw your earning at anytime.<br><br>3. A certain amount of SFT will be added to your balance alongside your daily return.<br><br>4. Most importantly, Softies will get bigger percentage of their earnings after TGE, and before regular users.<br><br>`,
                `<b>Earn More</b><br><br>Softcoin is packed with many activities for earning and having fun.<br><br>Click on 'More' below the screen to see many other ways you can earn Softcoin with ease.<br><br>`,
                `Thank You for taking the tour.<br><br>You can read extensively about the core value, mission statement, and tokenomics of the project in our <a href="/whitepaper">white paper</a>.<br><br>If you need assistance with anything, simply click on the logo at the top left corner of the screen, and we will be ready to assist in any way I can.<br><br>Happy mining!<br><br>`
            ];

            const buttons = [
                `<button id="no-thanks">No, thank you!</button><button id="yes-please">Yes, please.</button>`,
                `<button id="start">Start</button>`,
                `<button id="end-tour">End Tour</button><button id="continue">Continue</button>`,
                `<button id="end-tour">End Tour</button><button id="continue">Continue</button>`,
                `<button id="end-tour">End Tour</button><button id="continue">Continue</button>`,
                `<button id="end-tour">End Tour</button><button id="continue">Continue</button>`,
                `<button id="end-tour">End Tour</button><button id="continue">Continue</button>`,
                `<button id="end-tour">End Tour</button><button id="continue">Continue</button>`,
                `<button id="end-tour">End Tour</button><button id="continue">Continue</button>`,
                `<button id="start">Start</button>`
            ];

            const openModal = (index) => {
                cherryMessage.innerHTML = messages[index];
                const buttonsContainer = document.createElement('div');
                buttonsContainer.innerHTML = buttons[index];
                cherryMessage.appendChild(buttonsContainer);
                cherryModal.style.display = 'flex';

                if (index === 0) {
                    document.getElementById('no-thanks').addEventListener('click', () => {
                        openModal(1);
                    });

                    document.getElementById('yes-please').addEventListener('click', () => {
                        openModal(2);
                    });
                } else if (index === 1 || index === 9) {
                    document.getElementById('start').addEventListener('click', () => {
                        cherryModal.style.display = 'none';
                    });
                } else {
                    document.getElementById('continue').addEventListener('click', () => {
                        openModal(index + 1);
                    });

                    document.getElementById('end-tour').addEventListener('click', () => {
                        openModal(1);
                    });
                }
            };

            const startIntroduction = () => {
                openModal(0);
            };

            cherryClose.addEventListener('click', () => {
                cherryModal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target === cherryModal) {
                    cherryModal.style.display = 'none';
                }
            });

            // Check if the user is coming from the login page
            if (document.referrer.includes('/login')) {
                // Start introduction and mark it as started
                startIntroduction();
                sessionStorage.setItem('introductionStarted', 'true');
            }

            cherryLogo.addEventListener('click', () => {
                cherryMessage.innerHTML = `
                    <p></p>
                    <button id="learn-more">Learn more</button>
                    <button id="read-whitepaper">Whitepaper</button>
                    <button id="report-issue">Report an issue</button>
                    <button id="whats-new">What's new?</button>
                    <button id="community">Community</button>
                `;
                cherryModal.style.display = 'flex';

                document.getElementById('learn-more').addEventListener('click', () => {
                    window.location.href = "/about";
                });

                document.getElementById('read-whitepaper').addEventListener('click', () => {
                    window.location.href = "/whitepaper";
                });

                document.getElementById('report-issue').addEventListener('click', () => {
                    window.location.href = "mailto:support@softcoin.world";
                });

                document.getElementById('whats-new').addEventListener('click', () => {
                    window.location.href = "https://twitter.com/softcoin__";
                });

                document.getElementById('community').addEventListener('click', () => {
                    window.location.href = "https://t.me/softcoinupdates";
                });
            });
        });
});
