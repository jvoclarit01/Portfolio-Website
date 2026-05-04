/**
 * Scroll Reveal Module
 * Handles scroll-triggered animations for sections
 */

const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('active');
        }
    });
}

// Initialize scroll handler
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

export default { reveals, revealOnScroll };
