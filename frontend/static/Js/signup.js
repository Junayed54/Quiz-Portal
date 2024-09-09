
async function register() {
    const username = document.getElementById('username').value;
    const phone_number = document.getElementById('phone_number').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorMessage = document.getElementById('error-message');
    const usernameError = document.getElementById('username-error');
    const phoneNumberError = document.getElementById('phone-number-error');
    const passwordError = document.getElementById('password-error');
    const roleError = document.getElementById('role-error');

    // Clear previous error messages
    errorMessage.textContent = '';
    usernameError.textContent = '';
    phoneNumberError.textContent = '';
    passwordError.textContent = '';
    roleError.textContent = '';

    try {
        const response = await fetch('/auth/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, phone_number, password, role })
        });

        if (response.ok) {
            // Redirect to login page upon successful registration
            window.location.href = '/login/';
        } else {
            const data = await response.json();
            if (data.username) {
                usernameError.textContent = data.username.join(', ');
            }
            if (data.phone_number) {
                phoneNumberError.textContent = data.phone_number.join(', ');
            }
            if (data.password) {
                passwordError.textContent = data.password.join(', ');
            }
            if (data.role) {
                roleError.textContent = data.role.join(', ');
            }
            if (data.non_field_errors) {
                errorMessage.textContent = data.non_field_errors.join(', ');
            }
            throw new Error(data.detail || 'Registration failed');
        }
    } catch (error) {
        if (!errorMessage.textContent) {
            errorMessage.textContent = error.message;
        }
    }
}
