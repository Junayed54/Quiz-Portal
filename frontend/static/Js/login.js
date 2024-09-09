
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const phone_number = document.getElementById('phone_number').value;
    const password = document.getElementById('password').value;

    fetch('/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone_number: phone_number,
            password: password
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            window.location.href = '/';  // Redirect to home page on successful login
        } else {
            alert(data.detail || 'Invalid phone number or password');
        }
    })
    .catch(error => console.error('Error:', error));
});
