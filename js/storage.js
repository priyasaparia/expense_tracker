/* ========================================
   LOCAL STORAGE MANAGEMENT
   ======================================== */

class StorageManager {
    constructor() {
        this.DB_NAME = 'ExpenseTrackerDB';
        this.USERS_KEY = 'users';
        this.EXPENSES_KEY = 'expenses';
        this.CURRENT_USER_KEY = 'currentUser';
    }

    /**
     * Initialize storage with demo data
     */
    initialize() {
        if (!this.getAllUsers()) {
            this.setUsers([]);
            this.setExpenses([]);
        }
    }

    /**
     * Get all users
     */
    getAllUsers() {
        const data = localStorage.getItem(`${this.DB_NAME}_${this.USERS_KEY}`);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Set all users
     */
    setUsers(users) {
        localStorage.setItem(`${this.DB_NAME}_${this.USERS_KEY}`, JSON.stringify(users));
    }

    /**
     * Get user by email
     */
    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email);
    }

    /**
     * Get user by ID
     */
    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(user => user.id === userId);
    }

    /**
     * Create new user
     */
    createUser(userData) {
        const users = this.getAllUsers();
        
        // Check if user already exists
        if (this.getUserByEmail(userData.email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: generateId(),
            name: userData.name,
            email: userData.email,
            password: hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            preferences: {
                currency: 'USD',
                language: 'en',
                theme: 'light',
                dateFormat: 'MM/DD/YYYY',
                emailNotifications: true,
                expenseReminders: true,
                weeklyReports: true
            }
        };

        users.push(newUser);
        this.setUsers(users);
        
        return newUser;
    }

    /**
     * Update user
     */
    updateUser(userId, updates) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        users[userIndex] = { ...users[userIndex], ...updates };
        this.setUsers(users);
        
        return users[userIndex];
    }

    /**
     * Delete user
     */
    deleteUser(userId) {
        let users = this.getAllUsers();
        users = users.filter(u => u.id !== userId);
        this.setUsers(users);

        // Delete user's expenses
        this.deleteExpensesByUser(userId);

        // Logout if it's current user
        if (this.getCurrentUser()?.id === userId) {
            this.logout();
        }
    }

    /**
     * Get current logged in user
     */
    getCurrentUser() {
        const userId = localStorage.getItem(this.CURRENT_USER_KEY);
        if (userId) {
            return this.getUserById(userId);
        }
        return null;
    }

    /**
     * Set current user
     */
    setCurrentUser(userId) {
        localStorage.setItem(this.CURRENT_USER_KEY, userId);
    }

    /**
     * Login user
     */
    loginUser(email, password) {
        const user = this.getUserByEmail(email);
        
        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            throw new Error('Invalid password');
        }

        this.setCurrentUser(user.id);
        return user;
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    /**
     * Get all expenses for current user
     */
    getExpenses(userId = null) {
        const currentUserId = userId || this.getCurrentUser()?.id;
        if (!currentUserId) return [];

        const data = localStorage.getItem(`${this.DB_NAME}_${this.EXPENSES_KEY}_${currentUserId}`);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Set expenses for user
     */
    setExpenses(expenses, userId = null) {
        const currentUserId = userId || this.getCurrentUser()?.id;
        if (!currentUserId) return;

        localStorage.setItem(
            `${this.DB_NAME}_${this.EXPENSES_KEY}_${currentUserId}`,
            JSON.stringify(expenses)
        );
    }

    /**
     * Add new expense
     */
    addExpense(expenseData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        const expenses = this.getExpenses(currentUser.id);
        
        const newExpense = {
            id: generateId(),
            userId: currentUser.id,
            title: expenseData.title,
            amount: parseFloat(expenseData.amount),
            category: expenseData.category,
            type: expenseData.type || 'expense',
            date: expenseData.date,
            description: expenseData.description || '',
            paymentMethod: expenseData.paymentMethod || 'cash',
            recurring: expenseData.recurring || false,
            recurringFrequency: expenseData.recurringFrequency || null,
            createdAt: new Date().toISOString()
        };

        expenses.push(newExpense);
        this.setExpenses(expenses, currentUser.id);
        
        return newExpense;
    }

    /**
     * Get expense by ID
     */
    getExpenseById(expenseId) {
        const expenses = this.getExpenses();
        return expenses.find(e => e.id === expenseId);
    }

    /**
     * Update expense
     */
    updateExpense(expenseId, updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        const expenses = this.getExpenses(currentUser.id);
        const expenseIndex = expenses.findIndex(e => e.id === expenseId);
        
        if (expenseIndex === -1) {
            throw new Error('Expense not found');
        }

        expenses[expenseIndex] = { ...expenses[expenseIndex], ...updates };
        this.setExpenses(expenses, currentUser.id);
        
        return expenses[expenseIndex];
    }

    /**
     * Delete expense
     */
    deleteExpense(expenseId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        let expenses = this.getExpenses(currentUser.id);
        expenses = expenses.filter(e => e.id !== expenseId);
        this.setExpenses(expenses, currentUser.id);
    }

    /**
     * Delete multiple expenses
     */
    deleteExpenses(expenseIds) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        let expenses = this.getExpenses(currentUser.id);
        expenses = expenses.filter(e => !expenseIds.includes(e.id));
        this.setExpenses(expenses, currentUser.id);
    }

    /**
     * Delete all expenses of user (on account deletion)
     */
    deleteExpensesByUser(userId) {
        localStorage.removeItem(`${this.DB_NAME}_${this.EXPENSES_KEY}_${userId}`);
    }

    /**
     * Get filtered expenses
     */
    getFilteredExpenses(filters = {}) {
        let expenses = this.getExpenses();

        if (filters.category && filters.category !== '') {
            expenses = expenses.filter(e => e.category === filters.category);
        }

        if (filters.type && filters.type !== '') {
            expenses = expenses.filter(e => e.type === filters.type);
        }

        if (filters.startDate && filters.endDate) {
            expenses = expenses.filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate >= filters.startDate && expenseDate <= filters.endDate;
            });
        }

        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            expenses = expenses.filter(e =>
                e.title.toLowerCase().includes(searchLower) ||
                e.description.toLowerCase().includes(searchLower)
            );
        }

        return expenses;
    }

    /**
     * Get monthly summary
     */
    getMonthlySummary() {
        const expenses = this.getExpenses();
        const summary = {};

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!summary[monthKey]) {
                summary[monthKey] = {
                    month: monthKey,
                    income: 0,
                    expenses: 0,
                    total: 0
                };
            }

            if (expense.type === 'income') {
                summary[monthKey].income += expense.amount;
            } else {
                summary[monthKey].expenses += expense.amount;
            }

            summary[monthKey].total = summary[monthKey].income - summary[monthKey].expenses;
        });

        return Object.values(summary).sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Get category breakdown
     */
    getCategoryBreakdown() {
        const expenses = this.getExpenses();
        const breakdown = {};

        expenses.forEach(expense => {
            if (expense.type === 'expense') {
                if (!breakdown[expense.category]) {
                    breakdown[expense.category] = 0;
                }
                breakdown[expense.category] += expense.amount;
            }
        });

        return breakdown;
    }

    /**
     * Create backup
     */
    createBackup() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        const backup = {
            timestamp: new Date().toISOString(),
            user: currentUser,
            expenses: this.getExpenses(currentUser.id)
        };

        return JSON.stringify(backup, null, 2);
    }

    /**
     * Restore backup
     */
    restoreBackup(backupData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        const backup = JSON.parse(backupData);
        
        if (backup.user.id !== currentUser.id) {
            throw new Error('Backup does not match current user');
        }

        this.setExpenses(backup.expenses, currentUser.id);
    }

    /**
     * Clear old expenses (for demo purposes)
     */
    clearExpenses(userId = null) {
        const currentUserId = userId || this.getCurrentUser()?.id;
        if (!currentUserId) return;

        localStorage.removeItem(`${this.DB_NAME}_${this.EXPENSES_KEY}_${currentUserId}`);
    }
}

// Create global instance
const storage = new StorageManager();

// Initialize storage on page load
document.addEventListener('DOMContentLoaded', () => {
    storage.initialize();

    // Check authentication before loading pages other than index.html
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'index.html' && !storage.getCurrentUser()) {
        redirectTo('index.html');
    }
});
