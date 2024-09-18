function fetchUserAttempts(examId) {
    const url = `/quiz/attempts/user_attempts/?exam_id=${examId}`; // Pass exam_id as a query parameter
    const tableBody = document.getElementById('attempts-table-body');
    const examTitleElement = document.getElementById('exam-title');
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

        if (data.length === 0) {
            const noDataMessage = `
                <tr>
                    <td colspan="3" class="text-center">No exam attempts found.</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', noDataMessage);
        } else {
            // Update exam title dynamically
            examTitleElement.textContent = `Exam Title: ${data[0].exam_title}`;

            // Loop through each exam attempt and add to the table
            data.forEach((attempt, index) => {
                const tableRow = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${attempt.total_correct_answers}</td>
                        <td>${new Date(attempt.timestamp).toLocaleString()}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', tableRow);
            });
        }
    })
    .catch(error => {
        // Show error alert if data fetching fails
        console.error('There was an error fetching exam attempts:', error);
        alertBox.classList.remove('d-none');
    });
}

// Call the function to fetch user attempts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Replace 'examId' with the actual exam ID from your URL or context
    const examId = window.location.pathname.split('/')[3];
    fetchUserAttempts(examId);
});
