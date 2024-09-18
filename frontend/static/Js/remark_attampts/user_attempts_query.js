document.getElementById('filter-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;

    fetchUserAttempts(month, year);
});

function fetchUserAttempts(month, year) {
    const url = `/quiz/user_attempts_query/?month=${month}&year=${year}`; // API endpoint

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
        const tableBody = document.getElementById('attempts-table-body');
        tableBody.innerHTML = ''; // Clear the table body
        // if(data.message)
        if (data.length === 0 || data.message || data.error) {
            const noDataMessage = `
                <tr>
                    <td colspan="3" class="text-center">No attempts found for the selected month.</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', noDataMessage);
        } else {
            data.forEach(attempt => {
                const tableRow = `
                    <tr>
                        <td>${attempt.exam_title}</td>
                        <td class='text-center'>${attempt.total_correct_answers}</td>
                        <td>${new Date(attempt.timestamp).toLocaleString()}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', tableRow);
            });
        }
    })
    .catch(error => {
        console.error('There was an error fetching user attempts:', error);
        document.getElementById('alert-box').classList.remove('d-none');
    });
}