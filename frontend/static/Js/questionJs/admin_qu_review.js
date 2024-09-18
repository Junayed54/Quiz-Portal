// Fetch and display users who have submitted questions
function fetchSubmittedUsers() {
    const accessToken = localStorage.getItem('access_token');

    fetch('/quiz/questions/submitted_users/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        const usersList = document.getElementById('submitted-users-list');
        usersList.innerHTML = ''; // Clear previous data

        data.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.total_questions}</td>
                <td><button class="btn btn-primary" onclick="redirectToQuestionsPage(${user.user_id})">View Questions</button></td>
            `;

            usersList.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching submitted users:', error));
}

// Fetch and display users who have reviewed questions
function fetchReviewedUsers() {
    const accessToken = localStorage.getItem('access_token');

    fetch('/quiz/questions/approved_users/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const usersList = document.getElementById('reviewed-users-list');
        usersList.innerHTML = ''; // Clear previous data

        data.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.total_approved_questions}</td>
                <td><button class="btn btn-primary" onclick="redirectToApprovedQuestionsPage(${user.user_id})">View Questions</button></td>
            `;

            usersList.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching reviewed users:', error));
}

// Redirect to the questions page for a specific user
function redirectToQuestionsPage(userId) {
    window.location.href = `/quiz/admin_qu_view/${userId}/`;
}

function redirectToApprovedQuestionsPage(userId) {
    window.location.href = `/quiz/approved_questions/${userId}/`;
}

// On page load, fetch data if the corresponding elements are present
window.onload = () => {
    if (document.getElementById('submitted-users-list')) {
        fetchSubmittedUsers();
    }

    if (document.getElementById('reviewed-users-list')) {
        fetchReviewedUsers();
    }

    // Uncomment this if you also need to fetch questions for a user on a different page
    // if (document.getElementById('questions-container')) {
    //     const userId = document.getElementById('questions-container').dataset.userId;
    //     fetchQuestions(userId);
    // }
};
