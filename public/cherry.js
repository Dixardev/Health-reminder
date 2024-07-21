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
                `Hello,<br><br><b>Welcome to Softcoin!</b><br><br>I'm Cherry,<br><br>I will be your personal assistant on this exciting journey.<br><br>Will you like to take a tour?`,
                `Alright,<br><br>If you need assistance with anything, simply click on the logo at the top left corner of the screen, and I will be ready to assist in any way I can.<br><br>Happy mining!<br>`,
                `Great! Let's begin.<br><br><b>What is Softcoin?</b><br><br>Softcoin is an Innovative crypto project with a vision to enrich and enhance the lives of every participant.<br><br>We are very particular about getting listed on major exchange platforms, at a valuable rate.<br>`,
                `<b>How To Mine</b><br><br>The homepage is the mining area. Click on 'Start Mining' to kickstart a mining sessio that will last for 2 hours.<br><br>You get 15,000 SFT for each mining session. When a session end, click 'Start Mining' to start a new session.<br>`,
                `<b>Level Upgrades</b><br><br>Increase your mining power by upgrading your mining level. The  higher you go, the bigger your reward, and the longer your mining sessions.<br><br><b>Special Occasion</b><br><br>Occasionally, there will be a significant increment in the mining reward given to users for a very limited period. Smart users can take this opportunity to gather as much coin as they can.`,
                `<b>Friends and Referral Bonuses</b><br><br>The best way to get as much coin as you can is by inviting your friends to join Softcoin through your referral link.<br><br>You will get 50,000 SFT for each friend you successfully invite. Your friend will also get get 50,000 coin for registering through your referral link.<br><br>Click on "Friends" on the navigation menu below the screen, there you will find your referral activity details and see the button you can click to copy your referral link.<br>`,
                `<b>Tasks</b><br><br>You can earn more coin by completing tasks. When you complete a task, your reward will be automatically added to your balance.<br><br>You will also get a reward for checking-in daily.<br>`,
                `<b>Softie</b><br><br>To become a premium member, you need to sign up as a Softie.<br><br>Benefit of Softie:<br><br>1. You get paid in USDT every day.<br><br>2. You can withdraw your earning at anytime.<br><br>3. You get an additional mining power and session lenght for every level you reach as a softie.<br><br>4. Most importantly, Softies will get bigger percentage of their earnings after TGE, and earlier than regular users will.<br>`,
                `<b>Earn More</b><br><br>Softcoin is packed with many activities for earning and having fun, click on 'More' below the screen to see many other ways you can earn Softcoin with ease.<br>`,
                `Thank You for taking the tour.<br><br>You can read extensively about the core value, mission statement, and tokenomics of the project in our <a href="/whitepaper">white paper</a>.<br><br>If you need assistance with anything, simply click on the logo at the top left corner of the screen, and I will be ready to assist in any way I can.<br><br>Happy mining!<br>`
            ];

            const buttons = [
                `<button id="no-thanks">No, thank you</button><button id="yes-please">Yes, please</button>`,
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
                    <p>Hello! How can I assist you today?</p>
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
