/**
 * Contact Form Module
 * Handles form validation and submission
 */

const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
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

        // Simulate form submission (replace with actual form submission logic)
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        contactForm.reset();

        // Clear message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
}

export default { contactForm, formMessage };
