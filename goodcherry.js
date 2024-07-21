document.addEventListener("DOMContentLoaded", () => {
    fetch('cherry.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('cherry-placeholder').innerHTML = data;

            const cherryLogo = document.getElementById('cherry-logo');
            const cherryModal = document.getElementById('cherry-modal');
            const cherryMessage = document.getElementById('cherry-message');
            const cherryClose = document.getElementsByClassName('cherry-close')[0];

            const messages = [
                `Hello,<br><br><b>Welcome to Softcoin!</b><br><br>I'm Cherry,<br><br>I will be your personal assistant on this exciting journey.<br><br>Will you like to take a tour of the project?`,
                `Good,<br><br>Whenever you need assistance with anything, simply click on the logo at the top left corner of the screen, and I will be ready to assist in any way I can.<br><br>Happy mining!`,
                `Great! Let's begin.<br><br><b>What is Softcoin?</b><br><br>Softcoin is an Innovative crypto project with a vision to enrich and enhance the life of its participants.<br><br>We are very particular about getting listed on major exchange platforms, at a valuable rate.`,
                `<b>How To Mine</b><br><br>The homepage is the mining area, and when you click on 'Start Mining', the mining starts immediately and will last for 2 hours.<br><br>Each mining session will give you 15,000 SFT.<br><br>When the mining stops after 2 hours, simply start it up again.`,
                `<b>Upgrades</b><br><br>You will have the choice to upgrade your mining power, higher level will lead to bigger reward and longer mining time.<br><br><b>Special Occasion</b><br><br>During special occasions, there will be a significant increment in the mining reward given to users. Smart users can take this opportunity to gather as much coin as they can.`,
                `<b>Friends and Referral Bonuses</b><br><br>The best way to mop up as much coin as you can is by inviting your friends to join Softcoin through your referral link.<br><br>You will get a substantial amount of SFT for each friend you successfully invite, the friend will also get a big bonus for using your referral link to sign up.<br><br>Click on "Friends" on the navigation menu below the screen, there you will see your referral activity details and see the button you can click to copy your referral link.`,
                `<b>Tasks</b><br><br>Go to the Tasks page to see many tasks you can complete to get extra coins. On completing the tasks, your reward will be automatically added to your balance.<br><br>You also get a reward for checking in daily.`,
                `<b>Softie</b><br><br>To become a premium member, you need to sign up as a Softie.<br><br>As a Softie:<br><br>1. You get a reward in USDT every day, which you can withdraw to your wallet at any time.<br><br>2. You get a permanently multiplied mining power.<br><br>3. You will get your airdrop first before every other member when Softcoin gets listed.<br><br>And many other benefits.`,
                `<b>Earn More</b><br><br>Softcoin is packed with many activities for earning and having fun, click on 'More' below the screen to see many other ways you can earn and have fun.`,
                `Thank You for taking your time to take this tour and understand the project.<br><br>You can read extensively on the core value, mission statement, and tokenomics of the project in our <a href="/whitepaper">white paper</a>.<br><br>Whenever you need assistance with anything, simply click on the logo at the top left corner of the screen, and I will be ready to assist in any way I can.<br><br>Happy mining!`
            ];

            const buttons = [
                `<button id="no-thanks" class="cherry-btn cherry-btn-red">No, thank you</button><button id="yes-please" class="cherry-btn cherry-btn-green">Yes, please</button>`,
                `<button id="start" class="cherry-btn cherry-btn-green">Start</button>`,
                `<button id="continue" class="cherry-btn cherry-btn-green">Continue</button><button id="end-tour" class="cherry-btn cherry-btn-red">End Tour</button>`,
                `<button id="continue" class="cherry-btn cherry-btn-green">Continue</button><button id="end-tour" class="cherry-btn cherry-btn-red">End Tour</button>`,
                `<button id="continue" class="cherry-btn cherry-btn-green">Continue</button><button id="end-tour" class="cherry-btn cherry-btn-red">End Tour</button>`,
                `<button id="continue" class="cherry-btn cherry-btn-green">Continue</button><button id="end-tour" class="cherry-btn cherry-btn-red">End Tour</button>`,
                `<button id="continue" class="cherry-btn cherry-btn-green">Continue</button><button id="end-tour" class="cherry-btn cherry-btn-red">End Tour</button>`,
                `<button id="continue" class="cherry-btn cherry-btn-green">Continue</button><button id="end-tour" class="cherry-btn cherry-btn-red">End Tour</button>`,
                `<button id="continue" class="cherry-btn cherry-btn-green">Continue</button><button id="end-tour" class="cherry-btn cherry-btn-red">End Tour</button>`,
                `<button id="start" class="cherry-btn cherry-btn-green">Start</button>`
            ];

            const openModal = (index) => {
                cherryMessage.innerHTML = ''; // Clear previous message
                const message = messages[index];
                let i = 0;

                function typeWriter() {
                    if (i < message.length) {
                        cherryMessage.innerHTML += message.charAt(i);
                        i++;
                        setTimeout(typeWriter, 30); // Adjust typing speed here
                    } else {
                        const buttonsContainer = document.createElement('div');
                        buttonsContainer.innerHTML = buttons[index];
                        buttonsContainer.style.marginTop = '20px'; // Gap between message and buttons
                        buttonsContainer.style.display = 'flex';
                        buttonsContainer.style.justifyContent = 'space-between'; // Align buttons
                        cherryMessage.appendChild(buttonsContainer);

                        // Add event listeners to the buttons after the typing effect is complete
                        if (index === 0) {
                            document.getElementById('no-thanks').addEventListener('click', () => {
                                openModal(1);
                            });

                            document.getElementById('yes-please').addEventListener('click', () => {
                                openModal(2);
                            });
                        } else if (index === 1 || index === 10) {
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
                    }
                }

                typeWriter();
                cherryModal.style.display = 'flex';
            };

            const startIntroduction = () => {
                openModal(0);
            };

            cherryLogo.addEventListener('click', () => {
                openModal(0);
            });

            cherryClose.addEventListener('click', () => {
                cherryModal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target === cherryModal) {
                    cherryModal.style.display = 'none';
                }
            });

            // Check if the user is coming from the login page
            if (document.referrer.includes('/login')) { // Replace 'login.html' with your actual login page URL
                startIntroduction();
            }
        });
});

// Adding the styles for the buttons dynamically
const style = document.createElement('style');
style.innerHTML = `
    .cherry-btn {
        margin: 0 10px;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .cherry-btn-red {
        background-color: #f44336;
        color: white;
    }

    .cherry-btn-green {
        background-color: #4CAF50;
        color: white;
    }

    .cherry-btn:hover {
        opacity: 0.8;
    }
`;

document.head.appendChild(style);
