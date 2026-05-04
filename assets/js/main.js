/**
 * Portfolio - Main JavaScript Entry Point
 * Loads all modules and initializes the application
 */

// Load modules
import './modules/cursor.js';
import './modules/dottedSurface.js';
import './modules/navigation.js';
import './modules/scrollReveal.js';
import './modules/contactForm.js';

// Skill Level Animation
const skillLevels = document.querySelectorAll('.skill-level-fill');

function animateSkills() {
    skillLevels.forEach(skill => {
        const rect = skill.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const level = skill.getAttribute('data-level');
            if (level) {
                skill.style.width = level + '%';
            }
        }
    });
}

window.addEventListener('scroll', animateSkills);
animateSkills();

console.log('Portfolio loaded successfully');
