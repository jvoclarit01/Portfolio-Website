/**
 * Contact Form Module
 * Handles form validation and submission
 */

const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Simple validation
        if (!name || !email || !message) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Please fill in all fields.';
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Please enter a valid email address.';
            return;
        }

        // Submit to backend API
        const submitButton = contactForm.querySelector('.form-submit');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
            const response = await fetch('http://localhost:3001/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (data.success) {
                formMessage.className = 'form-message success';
                formMessage.textContent = data.message || 'Message sent successfully! I\'ll get back to you soon.';
                contactForm.reset();
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = data.message || 'Failed to send message. Please try again.';
            }
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Failed to send message. Please check your connection and try again.';
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }

        // Clear message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
}

export default { contactForm, formMessage };
