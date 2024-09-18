document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    const logout = document.getElementById('logout');
    const teacher = document.getElementById('teacher');
    const admin = document.getElementById('admin');
    const teacher_admin = document.getElementById('teacheradmin');
    const login = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout');
    // teacher.classList.add('d-none');
    // Check if the required elements exist in the DOM
    if (logout && teacher && login && logoutBtn) {
        
        if (accessToken) {
            logout.classList.remove('d-none');
            login.classList.add('d-none');
            
            // Add logout functionality
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.reload();
            });

            // Fetch the user role
            fetch('/auth/user-role/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.role === 'teacher') {
                    teacher.classList.remove('d-none');
                    
                }
                else if(data.role === 'admin'){
                    admin.classList.remove('d-none');
                }
                else if(data.role =='admin' || data.role =='teacher'){
                    teacher_admin.classList.remove('d-none');
                }
                else{
                    teacher.classList.add('d-none');
                    // console.log("hello2");
                }
            })
            .catch(error => console.error('Error:', error));

        } else {
            login.classList.remove('d-none');
            
        }
    } else {
        
        console.error('Required elements are missing from the DOM');
    }
});
