/* ========================================
   EXPENSE MANAGEMENT LOGIC
   ======================================== */

const addExpenseForm = document.getElementById('addExpenseForm');
const recurringExpense = document.getElementById('recurringExpense');
const recurringOptions = document.getElementById('recurringOptions');

/**
 * Show/Hide recurring options
 */
if (recurringExpense && recurringOptions) {
    recurringExpense.addEventListener('change', function() {
        recurringOptions.style.display = this.checked ? 'block' : 'none';
    });
}

/**
 * Set today's date as default
 */
if (document.getElementById('expenseDate')) {
    document.getElementById('expenseDate').value = getTodayDate();
}

/**
 * Handle Add Expense Form
 */
if (addExpenseForm) {
    addExpenseForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('expenseTitle').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const date = document.getElementById('expenseDate').value;
        const description = document.getElementById('expenseDescription').value.trim();
        const type = document.getElementById('expenseType').value;
        const paymentMethod = document.getElementById('expensePayment').value;
        const recurring = document.getElementById('recurringExpense').checked;
        const recurringFrequency = document.getElementById('recurringFrequency').value;

        // Clear errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // Validation
        let isValid = true;

        if (!title) {
            displayError('titleError', 'Title is required');
            isValid = false;
        }

        if (!amount || amount <= 0) {
            displayError('amountError', 'Please enter a valid amount');
            isValid = false;
        }

        if (!category) {
            displayError('categoryError', 'Please select a category');
            isValid = false;
        }

        if (!date) {
            displayError('dateError', 'Please select a date');
            isValid = false;
        }

        if (!type) {
            displayError('typeError', 'Please select expense type');
            isValid = false;
        }

        if (!isValid) return;

        try {
            // Add expense to storage
            const expense = storage.addExpense({
                title: title,
                amount: amount,
                category: category,
                type: type,
                date: date,
                description: description,
                paymentMethod: paymentMethod,
                recurring: recurring,
                recurringFrequency: recurringFrequency
            });

            // Show success message
            showNotification(`${title} added successfully!`, 'success');

            // Reset form
            addExpenseForm.reset();
            document.getElementById('expenseDate').value = getTodayDate();
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

            // Redirect after 1 second
            setTimeout(() => {
                redirectTo('dashboard.html');
            }, 1000);

        } catch (error) {
            displayError('errorMessage', error.message || 'Failed to add expense');
        }
    });
}

/**
 * Template buttons functionality
 */
document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        const title = this.getAttribute('data-title');
        const amount = this.getAttribute('data-amount');

        document.getElementById('expenseTitle').value = title;
        document.getElementById('expenseAmount').value = amount;
        document.getElementById('expenseCategory').value = category;
        document.getElementById('expenseDate').value = getTodayDate();
        document.getElementById('expenseType').value = 'expense';

        // Scroll to form
        document.getElementById('expenseTitle').focus();
        showNotification(`Template "${title}" loaded`, 'info');
    });
});

/**
 * Edit Expense Modal
 */
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
let currentEditingExpenseId = null;

/**
 * Open edit modal
 */
function openEditModal(expenseId) {
    const expense = storage.getExpenseById(expenseId);
    if (!expense) return;

    currentEditingExpenseId = expenseId;

    // Populate form
    document.getElementById('editTitle').value = expense.title;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editCategory').value = expense.category;
    document.getElementById('editDate').value = expense.date;
    document.getElementById('editDescription').value = expense.description;

    // Show modal
    if (editModal) {
        editModal.style.display = 'flex';
        editModal.classList.add('active');
    }
}

/**
 * Close edit modal
 */
function closeEditModal() {
    if (editModal) {
        editModal.style.display = 'none';
        editModal.classList.remove('active');
    }
    currentEditingExpenseId = null;
}

/**
 * Handle edit form submission
 */
if (editForm) {
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!currentEditingExpenseId) return;

        try {
            storage.updateExpense(currentEditingExpenseId, {
                title: document.getElementById('editTitle').value,
                amount: parseFloat(document.getElementById('editAmount').value),
                category: document.getElementById('editCategory').value,
                date: document.getElementById('editDate').value,
                description: document.getElementById('editDescription').value
            });

            showNotification('Expense updated successfully!', 'success');
            closeEditModal();
            loadExpenses();

        } catch (error) {
            showNotification(error.message || 'Failed to update expense', 'error');
        }
    });
}

/**
 * Close modal when clicking X
 */
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeEditModal);
});

/**
 * Close modal when clicking outside
 */
if (editModal) {
    editModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
}

/**
 * Delete expense
 */
function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            storage.deleteExpense(expenseId);
            showNotification('Expense deleted successfully!', 'success');
            loadExpenses();
            updateDashboard();
        } catch (error) {
            showNotification(error.message || 'Failed to delete expense', 'error');
        }
    }
}

/**
 * Load and display expenses
 */
function loadExpenses() {
    try {
        const expenses = storage.getExpenses();
        const expensesList = document.getElementById('expensesList');
        const expensesCard = document.getElementById('expensesCard');
        const expensesTableBody = document.getElementById('expensesTableBody');

        if (!expensesList && !expensesCard) return;

        // Clear existing content
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
            if (expensesTableBody) expensesTableBody.innerHTML = `<tr class="empty-row"><td colspan="7" class="empty-state"><p>No expenses found. <a href="add-expense.html">Add your first expense</a></p></td></tr>`;
            return;
        }

        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        expenses.forEach(expense => {
            // List view
            if (expensesList) {
                const listItem = createExpenseListItem(expense);
                expensesList.appendChild(listItem);
            }

            // Card view
            if (expensesCard) {
                const card = createExpenseCard(expense);
                expensesCard.appendChild(card);
            }

            // Table view
            if (expensesTableBody) {
                const row = createExpenseTableRow(expense);
                expensesTableBody.appendChild(row);
            }
        });

    } catch (error) {
        console.error('Error loading expenses:', error);
        showNotification('Failed to load expenses', 'error');
    }
}

/**
 * Create expense list item
 */
function createExpenseListItem(expense) {
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
        <div class="transaction-actions">
            <button class="btn btn-secondary btn-small" onclick="openEditModal('${expense.id}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteExpense('${expense.id}')">Delete</button>
        </div>
    `;
    return item;
}

/**
 * Create expense card
 */
function createExpenseCard(expense) {
    const card = document.createElement('div');
    card.className = 'expense-card';
    card.innerHTML = `
        <div class="expense-card-header">
            <h3 class="expense-card-title">${expense.title}</h3>
            <span class="expense-card-category">${getCategoryName(expense.category)}</span>
        </div>
        <div class="expense-card-amount ${expense.type}">${expense.type === 'income' ? '+' : '-'}${formatCurrency(expense.amount)}</div>
        <div class="expense-card-date">${formatDate(expense.date)}</div>
        ${expense.description ? `<p class="expense-card-description">${expense.description}</p>` : ''}
        <div class="expense-card-actions">
            <button class="btn btn-secondary btn-small" onclick="openEditModal('${expense.id}')">✏️ Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteExpense('${expense.id}')">🗑️ Delete</button>
        </div>
    `;
    return card;
}

/**
 * Create expense table row
 */
function createExpenseTableRow(expense) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formatDate(expense.date)}</td>
        <td>${expense.title}</td>
        <td>${getCategoryName(expense.category)}</td>
        <td><span style="text-transform: capitalize;">${expense.type}</span></td>
        <td style="color: ${expense.type === 'income' ? '#10b981' : '#ef4444'};">${expense.type === 'income' ? '+' : '-'}${formatCurrency(expense.amount)}</td>
        <td style="text-transform: capitalize;">${expense.paymentMethod}</td>
        <td>
            <button class="btn btn-secondary btn-small" onclick="openEditModal('${expense.id}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteExpense('${expense.id}')">Delete</button>
        </td>
    `;
    return row;
}

/**
 * Load on page
 */
document.addEventListener('DOMContentLoaded', loadExpenses);
