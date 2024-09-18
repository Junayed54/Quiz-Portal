// Function to redirect to the user attempts page for a specific exam
function redirectToUserAttemptsPage(examId) {
    // Construct the URL for the user attempts page
    const url = `/quiz/exam_attempts/${examId}/`; // Correct URL for specific exam
    // Redirect the user to the user attempts page
    window.location.href = url;
}

// Function to fetch all exams with their attempt counts and display them
function fetchAllExamsWithAttempts() {
    const url = '/quiz/exams/all_exams_with_attempts/'; // API endpoint for fetching exams
    const tableBody = document.getElementById('exams-table-body');
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
        // Loop through each exam and add to the table
        data.forEach(exam => {
            const tableRow = `
                <tr>
                    <td>${exam.exam_title}</td>
                    <td>${exam.num_attempts}</td>
                    <td>
                        <button class="btn btn-primary" onclick="redirectToUserAttemptsPage('${exam.exam_id}')">
                            View all attempters
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', tableRow);
        });
    })
    .catch(error => {
        // Show error alert if data fetching fails
        console.error('There was an error fetching exams with attempts:', error);
        alertBox.classList.remove('d-none');
    });
}

// Call the function to fetch and display all exams with attempts when the page loads
document.addEventListener('DOMContentLoaded', fetchAllExamsWithAttempts);
