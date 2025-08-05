class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentEditId = null;
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.renderUsers();
        this.updateUserCount();
    }

    // Load users from localStorage
    loadUsers() {
        const savedUsers = localStorage.getItem('users');
        return savedUsers ? JSON.parse(savedUsers) : this.getSampleUsers();
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Get sample users for demonstration
    getSampleUsers() {
        return [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                city: 'New York'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+1 (555) 987-6543',
                city: 'Los Angeles'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                phone: '+1 (555) 456-7890',
                city: 'Chicago'
            }
        ];
    }

    // Setup all event listeners
    setupEventListeners() {
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.closeModal();
            }
        });
    }

    handleFormSubmit() {
        const formData = new FormData(document.getElementById('userForm'));
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city')
        };

        if (this.currentEditId) {
            this.updateUser(this.currentEditId, userData);
        } else {
            this.createUser(userData);
        }
    }

    // Create new user
    createUser(userData) {
        const newUser = {
            id: this.generateId(),
            ...userData
        };

        this.users.push(newUser);
        this.saveUsers();
        this.renderUsers();
        this.updateUserCount();
        this.showMessage('User created successfully!', 'success');
        this.resetForm();
    }

    // Update existing user
    updateUser(id, userData) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...userData };
            this.saveUsers();
            this.renderUsers();
            this.updateUserCount();
            this.showMessage('User updated successfully!', 'success');
            this.cancelEdit();
        }
    }

    // Delete user
    deleteUser(id) {
        this.currentDeleteId = id;
        this.showModal();
    }

    // Confirm delete action
    confirmDelete() {
        if (this.currentDeleteId) {
            this.users = this.users.filter(user => user.id !== this.currentDeleteId);
            this.saveUsers();
            this.renderUsers();
            this.updateUserCount();
            this.showMessage('User deleted successfully!', 'success');
            this.closeModal();
            this.currentDeleteId = null;
        }
    }

    // Edit user
    editUser(id) {
        const user = this.users.find(user => user.id === id);
        if (user) {
            this.currentEditId = id;
            this.populateForm(user);
            this.updateFormUI();
        }
    }

    // Populate form with user data
    populateForm(user) {
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
        document.getElementById('city').value = user.city;
    }

    // Update form UI for edit mode
    updateFormUI() {
        document.getElementById('form-title').textContent = 'Edit User';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update User';
        document.getElementById('cancelBtn').style.display = 'block';
    }

    // Cancel edit mode
    cancelEdit() {
        this.currentEditId = null;
        this.resetForm();
        document.getElementById('form-title').textContent = 'Add New User';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> Add User';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    // Reset form
    resetForm() {
        document.getElementById('userForm').reset();
    }

    // Handle search functionality
    handleSearch(searchTerm) {
        const filteredUsers = this.users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
        );
        this.renderUsers(filteredUsers);
        this.updateUserCount(filteredUsers.length);
    }

    // Render users table
    renderUsers(usersToRender = this.users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        if (usersToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #6c757d; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        No users found
                    </td>
                </tr>
            `;
            return;
        }

        usersToRender.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'new-row';
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${this.escapeHtml(user.name)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td>${this.escapeHtml(user.phone)}</td>
                <td>${this.escapeHtml(user.city)}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="userManager.editUser(${user.id})" class="btn btn-warning">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="userManager.deleteUser(${user.id})" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Update user count display
    updateUserCount(count = this.users.length) {
        const userCountElement = document.getElementById('userCount');
        userCountElement.textContent = `${count} user${count !== 1 ? 's' : ''} found`;
    }

    // Generate unique ID
    generateId() {
        return Math.max(...this.users.map(user => user.id), 0) + 1;
    }

    // Show modal
    showModal() {
        document.getElementById('deleteModal').style.display = 'block';
    }

    // Close modal
    closeModal() {
        document.getElementById('deleteModal').style.display = 'none';
    }

    // Show message
    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;

        // Insert message after header
        const header = document.querySelector('header');
        header.parentNode.insertBefore(messageElement, header.nextSibling);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 3000);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});

// Additional utility functions

// Export data to JSON
function exportData() {
    const dataStr = JSON.stringify(userManager.users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-data.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Import data from JSON
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedUsers = JSON.parse(e.target.result);
                    if (Array.isArray(importedUsers)) {
                        userManager.users = importedUsers;
                        userManager.saveUsers();
                        userManager.renderUsers();
                        userManager.updateUserCount();
                        userManager.showMessage('Data imported successfully!', 'success');
                    } else {
                        userManager.showMessage('Invalid data format!', 'error');
                    }
                } catch (error) {
                    userManager.showMessage('Error importing data!', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        userManager.users = [];
        userManager.saveUsers();
        userManager.renderUsers();
        userManager.updateUserCount();
        userManager.showMessage('All data cleared!', 'success');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N for new user
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        userManager.cancelEdit();
        document.getElementById('name').focus();
    }
    
    // Ctrl/Cmd + F for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape to cancel edit
    if (e.key === 'Escape') {
        userManager.cancelEdit();
    }
});

// Add some helpful console messages
console.log(`
🚀 CRUD Application Loaded!

Available functions:
- userManager.createUser(data)
- userManager.updateUser(id, data)
- userManager.deleteUser(id)
- userManager.editUser(id)
- exportData()
- importData()
- clearAllData()

Keyboard shortcuts:
- Ctrl/Cmd + N: New user
- Ctrl/Cmd + F: Search
- Escape: Cancel edit
`);
