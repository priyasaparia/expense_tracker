/* ========================================
   DASHBOARD FUNCTIONALITY
   ======================================== */

/**
 * Update dashboard with current data
 */
function updateDashboard() {
    try {
        const currentUser = storage.getCurrentUser();
        if (!currentUser) return;

        // Update welcome message
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = currentUser.name.split(' ')[0];
        }

        // Get expenses
        const expenses = storage.getExpenses();
        
        // Calculate totals
        const totalIncome = expenses
            .filter(e => e.type === 'income')
            .reduce((sum, e) => sum + e.amount, 0);

        const totalExpenses = expenses
            .filter(e => e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Calculate monthly savings
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyIncome = expenses
            .filter(e => e.type === 'income' && new Date(e.date) >= monthStart)
            .reduce((sum, e) => sum + e.amount, 0);

        const monthlyExpenses = expenses
            .filter(e => e.type === 'expense' && new Date(e.date) >= monthStart)
            .reduce((sum, e) => sum + e.amount, 0);

        const monthlySavings = monthlyIncome - monthlyExpenses;

        // Update summary cards
        const totalIncomeEl = document.getElementById('totalIncome');
        const totalExpensesEl = document.getElementById('totalExpenses');
        const balanceEl = document.getElementById('balance');
        const monthlySavingsEl = document.getElementById('monthlySavings');

        if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncome);
        if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(totalExpenses);
        if (balanceEl) {
            balanceEl.textContent = formatCurrency(balance);
            balanceEl.style.color = balance >= 0 ? '#10b981' : '#ef4444';
        }
        if (monthlySavingsEl) {
            monthlySavingsEl.textContent = formatCurrency(monthlySavings);
            monthlySavingsEl.style.color = monthlySavings >= 0 ? '#10b981' : '#ef4444';
        }

        // Update recent transactions
        updateRecentTransactions(expenses);

        // Update charts
        createCharts(expenses);

    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

/**
 * Update recent transactions section
 */
function updateRecentTransactions(expenses) {
    const recentList = document.getElementById('recentTransactionsList');
    if (!recentList) return;

    recentList.innerHTML = '';

    if (expenses.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet. <a href="add-expense.html">Add your first expense</a></p>
            </div>
        `;
        return;
    }

    // Sort by date (newest first) and get top 5
    const recent = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recent.forEach(expense => {
        const item = createRecentTransactionItem(expense);
        recentList.appendChild(item);
    });
}

/**
 * Create recent transaction item
 */
function createRecentTransactionItem(expense) {
    const item = document.createElement('div');
    item.className = `transaction-item ${expense.type}`;
    item.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon">${getCategoryEmoji(expense.category)}</div>
            <div class="transaction-details">
                <h4>${expense.title}</h4>
                <p>${formatDate(expense.date)} • ${getCategoryName(expense.category)}</p>
            </div>
        </div>
        <div class="transaction-amount ${expense.type}">${expense.type === 'income' ? '+' : '-'}${formatCurrency(expense.amount)}</div>
    `;
    return item;
}

/**
 * View Expenses Page - Filter and Search
 */
if (document.getElementById('searchInput')) {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const dateFilter = document.getElementById('dateFilter');
    const customDateFilter = document.getElementById('customDateFilter');
    const sortBy = document.getElementById('sortBy');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const viewButtons = document.querySelectorAll('.view-btn');

    // Show/hide custom date filter
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            if (customDateFilter) {
                customDateFilter.style.display = this.value === 'custom' ? 'flex' : 'none';
            }
        });
    }

    // View toggle
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.view-container').forEach(container => {
                container.classList.remove('active');
            });

            const viewContainer = document.getElementById(`${view}View`);
            if (viewContainer) viewContainer.classList.add('active');
        });
    });

    // Filter and search
    function applyFilters() {
        const expenses = storage.getExpenses();
        let filtered = [...expenses];

        // Search filter
        if (searchInput.value) {
            const searchLower = searchInput.value.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(searchLower) ||
                e.description.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (categoryFilter.value) {
            filtered = filtered.filter(e => e.category === categoryFilter.value);
        }

        // Type filter
        if (typeFilter.value) {
            filtered = filtered.filter(e => e.type === typeFilter.value);
        }

        // Date filter
        if (dateFilter.value && dateFilter.value !== 'all') {
            if (dateFilter.value === 'custom') {
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    filtered = filtered.filter(e => {
                        const expDate = new Date(e.date);
                        return expDate >= start && expDate <= end;
                    });
                }
            } else {
                const dateRange = getDateRange(dateFilter.value);
                filtered = filtered.filter(e => {
                    const expDate = new Date(e.date);
                    return expDate >= dateRange.start && expDate <= dateRange.end;
                });
            }
        }

        // Sort
        if (sortBy.value === 'recent') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy.value === 'oldest') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortBy.value === 'amount-high') {
            filtered.sort((a, b) => b.amount - a.amount);
        } else if (sortBy.value === 'amount-low') {
            filtered.sort((a, b) => a.amount - b.amount);
        } else if (sortBy.value === 'category') {
            filtered.sort((a, b) => a.category.localeCompare(b.category));
        }

        // Update stats
        updateFilteredStats(filtered);

        // Update views
        updateExpenseViews(filtered);
    }

    // Event listeners
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
    if (sortBy) sortBy.addEventListener('change', applyFilters);
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = '';
            typeFilter.value = '';
            dateFilter.value = 'all';
            if (customDateFilter) customDateFilter.style.display = 'none';
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            sortBy.value = 'recent';
            applyFilters();
        });
    }

    // Date range filters
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput) startDateInput.addEventListener('change', applyFilters);
    if (endDateInput) endDateInput.addEventListener('change', applyFilters);

    // Initial load
    applyFilters();
}

/**
 * Update filtered stats
 */
function updateFilteredStats(expenses) {
    const filteredTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const filteredCount = expenses.length;
    const filteredAverage = filteredCount > 0 ? filteredTotal / filteredCount : 0;

    const totalEl = document.getElementById('filteredTotal');
    const countEl = document.getElementById('filteredCount');
    const averageEl = document.getElementById('filteredAverage');

    if (totalEl) totalEl.textContent = formatCurrency(filteredTotal);
    if (countEl) countEl.textContent = filteredCount;
    if (averageEl) averageEl.textContent = formatCurrency(filteredAverage);
}

/**
 * Update expense views
 */
function updateExpenseViews(expenses) {
    const expensesList = document.getElementById('expensesList');
    const expensesCard = document.getElementById('expensesCard');
    const expensesTableBody = document.getElementById('expensesTableBody');

    // Clear
    if (expensesList) expensesList.innerHTML = '';
    if (expensesCard) expensesCard.innerHTML = '';
    if (expensesTableBody) expensesTableBody.innerHTML = '';

    if (expenses.length === 0) {
        const emptyHtml = `
            <div class="empty-state">
                <p>No expenses found. <a href="add-expense.html">Add your first expense</a></p>
            </div>
        `;
        if (expensesList) expensesList.innerHTML = emptyHtml;
        if (expensesCard) expensesCard.innerHTML = emptyHtml;
        if (expensesTableBody) expensesTableBody.innerHTML = `<tr class="empty-row"><td colspan="7" class="empty-state"><p>No expenses found.</p></td></tr>`;
        return;
    }

    expenses.forEach(expense => {
        if (expensesList) {
            const listItem = createExpenseListItem(expense);
            expensesList.appendChild(listItem);
        }
        if (expensesCard) {
            const card = createExpenseCard(expense);
            expensesCard.appendChild(card);
        }
        if (expensesTableBody) {
            const row = createExpenseTableRow(expense);
            expensesTableBody.appendChild(row);
        }
    });
}

/**
 * Profile Page - Update user info
 */
function loadProfilePage() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) return;

    // Update profile header
    const avatarInitial = document.getElementById('avatarInitial');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const memberSince = document.getElementById('memberSince');

    if (avatarInitial) avatarInitial.textContent = getInitials(currentUser.name);
    if (profileName) profileName.textContent = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;
    if (memberSince) {
        const createdDate = new Date(currentUser.createdAt);
        memberSince.textContent = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // Load personal info
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');

    if (fullNameInput) fullNameInput.value = currentUser.name;
    if (emailInput) emailInput.value = currentUser.email;

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Remove active from buttons
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
            });

            // Show selected tab
            const selectedTab = document.getElementById(tabName);
            if (selectedTab) selectedTab.classList.add('active');
            this.classList.add('active');
        });
    });

    // Profile form handler
    const personalForm = document.getElementById('personalForm');
    if (personalForm) {
        personalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                storage.updateUser(currentUser.id, {
                    name: document.getElementById('fullName').value
                });
                showNotification('Profile updated successfully!', 'success');
                loadProfilePage();
            } catch (error) {
                showNotification(error.message || 'Failed to update profile', 'error');
            }
        });
    }

    // Password form handler
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;

            // Clear errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

            // Validation
            if (hashPassword(currentPassword) !== currentUser.password) {
                displayError('currentPasswordError', 'Current password is incorrect');
                return;
            }

            if (newPassword.length < 8) {
                displayError('newPasswordError', 'Password must be at least 8 characters');
                return;
            }

            if (newPassword !== confirmPassword) {
                displayError('confirmPasswordError', 'Passwords do not match');
                return;
            }

            try {
                storage.updateUser(currentUser.id, {
                    password: hashPassword(newPassword)
                });
                showNotification('Password changed successfully!', 'success');
                passwordForm.reset();
            } catch (error) {
                showNotification(error.message || 'Failed to change password', 'error');
            }
        });
    }

    // Preferences form handler
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const updatedPreferences = {
                    ...currentUser.preferences,
                    currency: document.getElementById('currency').value,
                    language: document.getElementById('language').value,
                    theme: document.getElementById('theme').value,
                    dateFormat: document.getElementById('dateFormat').value,
                    emailNotifications: document.getElementById('emailNotifications').checked,
                    expenseReminders: document.getElementById('expenseReminders').checked,
                    weeklyReports: document.getElementById('weeklyReports').checked
                };

                storage.updateUser(currentUser.id, {
                    preferences: updatedPreferences
                });
                showNotification('Preferences saved successfully!', 'success');
            } catch (error) {
                showNotification(error.message || 'Failed to save preferences', 'error');
            }
        });
    }

    // Data management handlers
    const exportDataBtn = document.getElementById('exportDataBtn');
    const createBackupBtn = document.getElementById('createBackupBtn');
    const restoreBackupBtn = document.getElementById('restoreBackupBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const expenses = storage.getExpenses();
            exportAsCSV(expenses, `expenses-${currentUser.email}-${new Date().toISOString().split('T')[0]}.csv`);
            showNotification('Data exported successfully!', 'success');
        });
    }

    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', () => {
            const backupData = storage.createBackup();
            const blob = new Blob([backupData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${currentUser.email}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('Backup created successfully!', 'success');
        });
    }

    if (restoreBackupBtn) {
        restoreBackupBtn.addEventListener('click', () => {
            document.getElementById('backupFile').click();
        });

        document.getElementById('backupFile').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        storage.restoreBackup(event.target.result);
                        showNotification('Backup restored successfully!', 'success');
                        loadProfilePage();
                    } catch (error) {
                        showNotification(error.message || 'Failed to restore backup', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('Are you sure? This action cannot be undone.')) {
                if (confirm('Your account and all data will be permanently deleted. Are you absolutely sure?')) {
                    try {
                        storage.deleteUser(currentUser.id);
                        showNotification('Account deleted successfully', 'success');
                        setTimeout(() => {
                            redirectTo('index.html');
                        }, 1500);
                    } catch (error) {
                        showNotification(error.message || 'Failed to delete account', 'error');
                    }
                }
            }
        });
    }
}

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    
    // Check if this is the profile page
    if (document.getElementById('personalForm')) {
        loadProfilePage();
    }
});

/**
 * Refresh dashboard periodically
 */
setInterval(updateDashboard, 30000);
