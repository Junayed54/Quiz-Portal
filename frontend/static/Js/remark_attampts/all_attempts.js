// Function to redirect to the user attempts page for a specific exam
function redirectToUserAttemptsPage(examId) {
    // Construct the URL for the user attempts page
    const url = `/quiz/user_attempts/${examId}/`; // Template URL for specific exam

    // Redirect the user to the user attempts page
    window.location.href = url;
}

// Function to fetch all exams and show attempts with buttons
function fetchAllExamsWithAttempts() {
    const url = '/quiz/attempts/all_attempts/'; // API endpoint to fetch exams with attempts
    const tableBody = document.getElementById('attempts-table-body');
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
        tableBody.innerHTML = ''; // Clear the table body
        console.log(data);
        // Check if there is any data returned
        if (data.length === 0) {
            const noDataMessage = `
                <tr>
                    <td colspan="3" class="text-center">No exam attempts found.</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', noDataMessage);
        } else {
            // Loop through each exam attempt and add to the table
            data.forEach(attempt => {
                const tableRow = `
                    <tr>
                        <td>${attempt.exam__title}</td>
                        <td>${attempt.num_attempts}</td>
                        <td>
                            <button class="btn btn-primary" onclick="redirectToUserAttemptsPage('${attempt.exam_id}')">
                                View Attempts
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', tableRow);
            });
        }
    })
    .catch(error => {
        // Show error alert if data fetching fails
        console.error('There was an error fetching exams with attempts:', error);
        alertBox.classList.remove('d-none');
    });
}

// Call the function to fetch and display all exams with attempts when the page loads
document.addEventListener('DOMContentLoaded', fetchAllExamsWithAttempts);
