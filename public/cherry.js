document.addEventListener("DOMContentLoaded", () => {
    fetch('cherry.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('cherry-placeholder').innerHTML = data;

            const conversationStarters = [
                "Hello there. How can I be of assistance today?",
                "Good morning, how may I help you?",
                "Hi! What can I do for you today?",
                "Greetings! Need any help?",
                "Hello! How can I assist you?",
                "Hey there! What do you need help with?",
                "Good day! How can I be of service?",
                "Hi! What would you like to know?",
                "Hello! What can I help you with?",
                "Hey! How can I assist you today?"
            ];

            const introductionMessages = [
                "Welcome to Softcoin! Let's take a quick tour.",
                "Hi! I'm Cherry, your assistant. Let me show you around Softcoin.",
                "Hello! I see you're new here. I'll guide you through the app.",
                "Greetings! Let's explore Softcoin together.",
                "Hey there! I'm Cherry. I'll help you get started with Softcoin.",
                "Hi! I'm here to guide you through Softcoin. Let's begin."
            ];

            const cherryLogo = document.getElementById('cherry-logo');
            const cherryModal = document.getElementById('cherry-modal');
            const cherryMessage = document.getElementById('cherry-message');
            const cherryClose = document.getElementsByClassName('cherry-close')[0];

            const startIntroduction = () => {
                const randomMessage = introductionMessages[Math.floor(Math.random() * introductionMessages.length)];
                cherryMessage.textContent = ''; // Clear previous message

                let i = 0;
                function typeWriter() {
                    if (i < randomMessage.length) {
                        cherryMessage.textContent += randomMessage.charAt(i);
                        i++;
                        setTimeout(typeWriter, 50); // Adjust typing speed here
                    }
                }

                typeWriter();
                cherryModal.style.display = 'flex';
                cherryModal.style.opacity = '1'; // Set the modal to be fully visible
                cherryModal.style.transform = 'scale(1)'; // Reset the scaling transformation
            };

            const openModal = (message) => {
                cherryMessage.textContent = ''; // Clear previous message

                let i = 0;
                function typeWriter() {
                    if (i < message.length) {
                        cherryMessage.textContent += message.charAt(i);
                        i++;
                        setTimeout(typeWriter, 50); // Adjust typing speed here
                    }
                }

                typeWriter();
                cherryModal.style.display = 'flex';
                cherryModal.style.opacity = '1'; // Set the modal to be fully visible
                cherryModal.style.transform = 'scale(1)'; // Reset the scaling transformation
            };

            cherryLogo.addEventListener('click', () => {
                const randomMessage = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
                openModal(randomMessage);
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
