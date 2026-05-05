// ============================================
// Admin Panel JavaScript
// ============================================

// Import cursor module
import './modules/cursor.js';
// Import dotted surface background
import './modules/dottedSurface.js';

// State
let apiKey = localStorage.getItem('adminApiKey') || '';
let currentFilter = 'all';
let currentSubmission = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const submissionsList = document.getElementById('submissionsList');
const filterBtns = document.querySelectorAll('.filter-btn');
const submissionModal = document.getElementById('submissionModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const deleteBtn = document.getElementById('deleteBtn');

// Stats elements
const totalCount = document.getElementById('totalCount');
const newCount = document.getElementById('newCount');
const readCount = document.getElementById('readCount');
const repliedCount = document.getElementById('repliedCount');

// ============================================
// Initialization
// ============================================
function init() {
    if (apiKey) {
        showDashboard();
    } else {
        showLogin();
    }

    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Refresh
    refreshBtn.addEventListener('click', loadSubmissions);

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadSubmissions();
        });
    });

    // Modal
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);

    // Delete button
    deleteBtn.addEventListener('click', handleDelete);

    // Status buttons in modal
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentSubmission) {
                updateSubmissionStatus(currentSubmission.id, btn.dataset.status);
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ============================================
// Authentication
// ============================================
function showLogin() {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadSubmissions();
}

async function handleLogin(e) {
    e.preventDefault();

    const inputKey = document.getElementById('apiKey').value.trim();

    if (!inputKey) {
        showLoginMessage('Please enter an API key', 'error');
        return;
    }

    // Test the API key
    try {
        const response = await fetch(`${window.API_URL}/api/submissions`, {
            headers: {
                'x-api-key': inputKey
            }
        });

        if (response.ok) {
            apiKey = inputKey;
            localStorage.setItem('adminApiKey', apiKey);
            showLoginMessage('Login successful!', 'success');
            setTimeout(() => {
                showDashboard();
            }, 500);
        } else {
            showLoginMessage('Invalid API key', 'error');
        }
    } catch (error) {
        showLoginMessage('Connection error. Is the server running?', 'error');
    }
}

function handleLogout() {
    apiKey = '';
    localStorage.removeItem('adminApiKey');
    showLogin();
    showLoginMessage('', '');
}

function showLoginMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = 'form-message';
    if (type) {
        loginMessage.classList.add(type);
    }
}

// ============================================
// API Calls
// ============================================
async function loadSubmissions() {
    showLoading();

    try {
        const url = currentFilter === 'all'
            ? `${window.API_URL}/api/submissions`
            : `${window.API_URL}/api/submissions?status=${currentFilter}`;

        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load submissions');
        }

        const data = await response.json();
        renderSubmissions(data.submissions || []);
        updateStats(data.stats || { total: 0, new: 0, read: 0, replied: 0 });
    } catch (error) {
        console.error('Error loading submissions:', error);
        showError('Failed to load submissions. Please try again.');
    }
}

async function updateSubmissionStatus(id, status) {
    try {
        const response = await fetch(`${window.API_URL}/api/submissions/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        // Update modal UI
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === status);
        });

        // Refresh list
        loadSubmissions();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status');
    }
}

async function deleteSubmission(id) {
    try {
        const response = await fetch(`${window.API_URL}/api/submissions/${id}`, {
            method: 'DELETE',
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete submission');
        }

        closeModal();
        loadSubmissions();
    } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Failed to delete submission');
    }
}

// ============================================
// Rendering
// ============================================
function renderSubmissions(submissions) {
    if (submissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p>No submissions yet</p>
            </div>
        `;
        return;
    }

    submissionsList.innerHTML = submissions.map(submission => `
        <div class="submission-card status-${submission.status}" data-id="${submission.id}">
            <div class="submission-header">
                <div class="submission-info">
                    <div class="submission-name">${escapeHtml(submission.name)}</div>
                    <div class="submission-email">${escapeHtml(submission.email)}</div>
                </div>
                <div class="submission-meta">
                    <span class="status-badge ${submission.status}">${submission.status}</span>
                    <span class="submission-date">${formatDate(submission.created_at)}</span>
                </div>
            </div>
            <div class="submission-message">${escapeHtml(submission.message)}</div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.submission-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            openModal(id);
        });
    });
}

function updateStats(stats) {
    totalCount.textContent = stats.total || 0;
    newCount.textContent = stats.new || 0;
    readCount.textContent = stats.read || 0;
    repliedCount.textContent = stats.replied || 0;
}

function showLoading() {
    submissionsList.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
        </div>
    `;
}

function showError(message) {
    submissionsList.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

// ============================================
// Modal
// ============================================
async function openModal(id) {
    try {
        const response = await fetch(`${window.API_URL}/api/submissions`, {
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load submission');
        }

        const data = await response.json();
        const submission = data.submissions.find(s => s.id === id);

        if (!submission) {
            throw new Error('Submission not found');
        }

        currentSubmission = submission;

        modalBody.innerHTML = `
            <div class="modal-field">
                <div class="modal-field-label">Name</div>
                <div class="modal-field-value">${escapeHtml(submission.name)}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Email</div>
                <div class="modal-field-value email">
                    <a href="mailto:${escapeHtml(submission.email)}">${escapeHtml(submission.email)}</a>
                </div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Status</div>
                <div class="modal-field-value">
                    <span class="status-badge ${submission.status}">${submission.status}</span>
                </div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Received</div>
                <div class="modal-field-value">${formatDate(submission.created_at)}</div>
            </div>
            <div class="modal-field">
                <div class="modal-field-label">Message</div>
                <div class="modal-field-value message">${escapeHtml(submission.message)}</div>
            </div>
        `;

        // Update status buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === submission.status);
        });

        submissionModal.classList.add('active');
    } catch (error) {
        console.error('Error opening modal:', error);
        alert('Failed to load submission details');
    }
}

function closeModal() {
    submissionModal.classList.remove('active');
    currentSubmission = null;
}

function handleDelete() {
    if (!currentSubmission) return;

    if (confirm(`Are you sure you want to delete this submission from ${currentSubmission.name}?`)) {
        deleteSubmission(currentSubmission.id);
    }
}

// ============================================
// Utilities
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than a minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than an hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    }

    // Less than a day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Less than a week
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Initialize on load
init();
