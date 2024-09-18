function fetchUserAttempts(examId) {
    const url = `/quiz/exams/${examId}/user_attempts/`; // API endpoint for specific exam
    const tableBody = document.getElementById('user-attempts-table-body');
    const alertBox = document.getElementById('alert-box');

    // Make an API call using fetch
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // Include JWT token if needed
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        tableBody.innerHTML = ''; // Clear the table body
        if (data.length === 0) {
            const noDataMessage = `
                <tr>
                    <td colspan="2" class="text-center">No attempts found for this exam.</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', noDataMessage);
        } else {
            // Loop through each user attempt and add to the table
            data.forEach(attempt => {
                const tableRow = `
                    <tr>
                        <td>${attempt.username}</td>
                        <td>${attempt.num_attempts}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', tableRow);
            });
        }
    })
    .catch(error => {
        // Show error alert if data fetching fails
        console.error('There was an error fetching user attempts:', error);
        alertBox.classList.remove('d-none');
    });
}

// Fetch the exam ID from the URL and call the function to display the attempts
document.addEventListener('DOMContentLoaded', function() {
    const examId = window.location.pathname.split('/')[3]; // Extract the exam ID from the URL
    fetchUserAttempts(examId); // Call the function to fetch attempts
});