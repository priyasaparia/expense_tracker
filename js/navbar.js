/* ========================================
   NAVBAR FUNCTIONALITY
   ======================================== */

const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');

/**
 * Toggle mobile navbar
 */
if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', function() {
        navbarMenu.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Close navbar when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbarMenu.classList.remove('active');
            navbarToggle.classList.remove('active');
        });
    });

    // Close navbar when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar')) {
            navbarMenu.classList.remove('active');
            navbarToggle.classList.remove('active');
        }
    });
}

/**
 * Set active navbar link based on current page
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);

/**
 * Display current user in navbar (if applicable)
 */
function displayCurrentUserInNavbar() {
    const currentUser = storage.getCurrentUser();
    if (currentUser && document.querySelector('.user-profile')) {
        document.querySelector('.user-name').textContent = currentUser.name;
    }
}

document.addEventListener('DOMContentLoaded', displayCurrentUserInNavbar);

/**
 * Highlight active section
 */
function highlightActiveSection() {
    const pageMap = {
        'dashboard.html': 'dashboard',
        'add-expense.html': 'add-expense',
        'view-expenses.html': 'view-expenses',
        'profile.html': 'profile'
    };

    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const sectionId = pageMap[currentPage];

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', highlightActiveSection);

/**
 * Smooth scroll for navigation
 */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        // Don't prevent default for page navigation
        if (href && !href.startsWith('#')) {
            // Page navigation, let it happen
        } else if (href && href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

/**
 * Navbar scroll effect
 */
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', function() {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
}

/**
 * Add keyboard navigation
 */
document.addEventListener('keydown', function(event) {
    // Alt + D for Dashboard
    if (event.altKey && event.key === 'd') {
        event.preventDefault();
        window.location.href = 'dashboard.html';
    }
    // Alt + A for Add Expense
    if (event.altKey && event.key === 'a') {
        event.preventDefault();
        window.location.href = 'add-expense.html';
    }
    // Alt + V for View Expenses
    if (event.altKey && event.key === 'v') {
        event.preventDefault();
        window.location.href = 'view-expenses.html';
    }
    // Alt + P for Profile
    if (event.altKey && event.key === 'p') {
        event.preventDefault();
        window.location.href = 'profile.html';
    }
});
