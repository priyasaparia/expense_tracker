/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Format currency for display
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

/**
 * Format date for input field
 */
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get date range based on filter
 */
function getDateRange(filter) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    switch(filter) {
        case 'today':
            return { start: today, end: today };
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return { start: weekStart, end: today };
        case 'month':
            return { start: startOfMonth, end: today };
        case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
            return { start: quarterStart, end: today };
        case 'year':
            return { start: startOfYear, end: today };
        default:
            return { start: new Date(2020, 0, 1), end: today };
    }
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
    const strength = {
        score: 0,
        level: 'weak'
    };

    if (password.length >= 8) strength.score++;
    if (password.length >= 12) strength.score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength.score++;
    if (/\d/.test(password)) strength.score++;
    if (/[^a-zA-Z\d]/.test(password)) strength.score++;

    if (strength.score >= 4) strength.level = 'strong';
    else if (strength.score >= 3) strength.level = 'fair';
    else strength.level = 'weak';

    return strength;
}

/**
 * Hash password (basic - for demo only)
 */
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

/**
 * Display error message
 */
function displayError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
    }
}

/**
 * Display success message
 */
function displaySuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => {
            element.classList.remove('show');
        }, 3000);
    }
}

/**
 * Generate unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-in;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Calculate statistics
 */
function calculateStats(expenses) {
    const stats = {
        total: 0,
        count: expenses.length,
        average: 0,
        byCategory: {}
    };

    expenses.forEach(expense => {
        stats.total += expense.amount;
        if (!stats.byCategory[expense.category]) {
            stats.byCategory[expense.category] = 0;
        }
        stats.byCategory[expense.category] += expense.amount;
    });

    stats.average = stats.count > 0 ? stats.total / stats.count : 0;

    return stats;
}

/**
 * Get category emoji
 */
function getCategoryEmoji(category) {
    const emojis = {
        food: '🍔',
        transportation: '🚗',
        entertainment: '🎬',
        shopping: '🛍️',
        utilities: '🔌',
        health: '💊',
        education: '📚',
        personal: '👤',
        savings: '💰',
        investment: '📈',
        travel: '✈️',
        other: '📌'
    };
    return emojis[category] || '📌';
}

/**
 * Get category name
 */
function getCategoryName(category) {
    const names = {
        food: 'Food & Dining',
        transportation: 'Transportation',
        entertainment: 'Entertainment',
        shopping: 'Shopping',
        utilities: 'Utilities',
        health: 'Health & Medical',
        education: 'Education',
        personal: 'Personal Care',
        savings: 'Savings',
        investment: 'Investment',
        travel: 'Travel',
        other: 'Other'
    };
    return names[category] || 'Other';
}

/**
 * Check if device is mobile
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return localStorage.getItem('currentUser') !== null;
}

/**
 * Redirect to page
 */
function redirectTo(page) {
    window.location.href = page;
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'error');
    });
}

/**
 * Export data as CSV
 */
function exportAsCSV(data, filename) {
    const headers = Object.keys(data[0] || {});
    const csv = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header =>
                JSON.stringify(row[header] || '')
            ).join(',')
        )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Parse CSV file
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index].trim();
            return obj;
        }, {});
    });
}

/**
 * Initialize event listeners for toggle forms
 */
function toggleForms() {
    const signInForm = document.querySelector('.sign-in-form');
    const signUpForm = document.querySelector('.sign-up-form');

    signInForm?.classList.toggle('active');
    signUpForm?.classList.toggle('active');
}

/**
 * Initialize accessibility features
 */
function initializeA11y() {
    // Add skip to main link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-main';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content ID if not exists
    const mainContent = document.querySelector('main');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
}

/**
 * Format large numbers with abbreviations
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
}

/**
 * Get initials from name
 */
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Initialize accessibility on page load
document.addEventListener('DOMContentLoaded', initializeA11y);
