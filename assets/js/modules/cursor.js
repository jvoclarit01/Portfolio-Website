/**
 * Custom Cursor Module
 * Handles custom cursor behavior with hover effects
 */

const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

// Only initialize if elements exist
if (cursor && cursorDot) {
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
        cursorDot.style.left = e.clientX - 2 + 'px';
        cursorDot.style.top = e.clientY - 2 + 'px';
    });

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll(
        'a, button, .btn, .skill-card, .project-card, .form-input, .form-textarea, .form-submit, ' +
        '.filter-btn, .status-btn, .logout-btn, .refresh-btn, .delete-btn, .modal-close, .nav-link, .submission-card'
    );
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

export default { cursor, cursorDot };
