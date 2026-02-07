/* ========================================
   AUTHENTICATION LOGIC
   ======================================== */

// Form Elements
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');

// Password toggle listeners
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '👁️‍🗨️';
        } else {
            input.type = 'password';
            this.textContent = '👁️';
        }
    });
});

/**
 * Handle Sign In
 */
if (signInForm) {
    signInForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('signInEmail').value.trim();
        const password = document.getElementById('signInPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Clear previous errors
        displayError('signInEmailError', '');
        displayError('signInPasswordError', '');
        displayError('signInError', '');

        // Validation
        let isValid = true;

        if (!email) {
            displayError('signInEmailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            displayError('signInEmailError', 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            displayError('signInPasswordError', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const user = storage.loginUser(email, password);

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', JSON.stringify({
                    email: email,
                    rememberMe: true
                }));
            }

            // Show success message and redirect
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                redirectTo('dashboard.html');
            }, 500);

        } catch (error) {
            displayError('signInError', error.message || 'Login failed. Please try again.');
        }
    });

    // Check for remembered email
    window.addEventListener('load', () => {
        const remembered = localStorage.getItem('rememberMe');
        if (remembered) {
            const { email } = JSON.parse(remembered);
            document.getElementById('signInEmail').value = email;
            document.getElementById('rememberMe').checked = true;
        }
    });
}

/**
 * Handle Sign Up
 */
if (signUpForm) {
    // Password strength indicator
    const passwordInput = document.getElementById('signUpPassword');
    const strengthBar = document.getElementById('strengthBar');

    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function() {
            const strength = validatePasswordStrength(this.value);
            strengthBar.className = `strength-bar ${strength.level}`;
        });
    }

    signUpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;
        const termsCheckbox = document.getElementById('termsCheckbox').checked;

        // Clear previous errors
        displayError('signUpNameError', '');
        displayError('signUpEmailError', '');
        displayError('signUpPasswordError', '');
        displayError('signUpConfirmPasswordError', '');
        displayError('signUpError', '');

        // Validation
        let isValid = true;

        if (!name) {
            displayError('signUpNameError', 'Full name is required');
            isValid = false;
        } else if (name.length < 2) {
            displayError('signUpNameError', 'Name must be at least 2 characters');
            isValid = false;
        }

        if (!email) {
            displayError('signUpEmailError', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            displayError('signUpEmailError', 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            displayError('signUpPasswordError', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            displayError('signUpPasswordError', 'Password must be at least 8 characters');
            isValid = false;
        }

        if (password !== confirmPassword) {
            displayError('signUpConfirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        if (!termsCheckbox) {
            displayError('signUpError', 'You must agree to the terms and conditions');
            isValid = false;
        }

        if (!isValid) return;

        try {
            // Check if user already exists
            if (storage.getUserByEmail(email)) {
                displayError('signUpError', 'Email already registered. Please use login instead.');
                return;
            }

            // Create new user
            const user = storage.createUser({
                name: name,
                email: email,
                password: password
            });

            // Auto login
            storage.setCurrentUser(user.id);

            // Show success and redirect
            showNotification('Account created successfully!', 'success');
            setTimeout(() => {
                redirectTo('dashboard.html');
            }, 500);

        } catch (error) {
            displayError('signUpError', error.message || 'Sign up failed. Please try again.');
        }
    });
}

/**
 * Logout functionality
 */
document.querySelectorAll('#logoutBtn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();

        // Confirm logout
        if (confirm('Are you sure you want to logout?')) {
            storage.logout();
            showNotification('You have been logged out', 'info');
            setTimeout(() => {
                redirectTo('index.html');
            }, 500);
        }
    });
});

/**
 * Password visibility toggle for profile
 */
document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });
});

/**
 * Form switching on index.html
 */
function toggleForms() {
    const signInForm = document.querySelector('.sign-in-form');
    const signUpForm = document.querySelector('.sign-up-form');
    
    if (signInForm && signUpForm) {
        signInForm.classList.toggle('active');
        signUpForm.classList.toggle('active');

        // Clear form data
        document.querySelectorAll('form input, form textarea').forEach(input => {
            input.value = '';
            input.dispatchEvent(new Event('input'));
        });
        
        // Clear error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }
}
