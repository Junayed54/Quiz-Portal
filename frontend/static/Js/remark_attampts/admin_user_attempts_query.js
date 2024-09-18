document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch users and populate the select dropdown
    function fetchUsers() {
        fetch('/quiz/students/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const userSelect = document.getElementById('user-id');
            data.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                userSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
    }

    // Fetch users on page load
    fetchUsers();

    // Handle form submission
    document.getElementById('admin-query-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const userId = document.getElementById('user-id').value;
        const month = document.getElementById('month').value;
        const year = document.getElementById('year').value;
        const url = `/quiz/admin_user_attempts/?user_id=${userId}&month=${month}&year=${year}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('attempts-table-body');
            tableBody.innerHTML = ''; // Clear the table body

            if (data.length === 0 || data.message || data.error) {
                const noDataMessage = `
                    <tr>
                        <td colspan="4" class="text-center">No attempts found for the selected month for this user.</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', noDataMessage);
            } else {
                data.forEach((attempt, index) => {
                    const tableRow = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${attempt.exam_title}</td>
                            <td class='text-center' >${attempt.total_correct_answers}</td>
                            <td>${new Date(attempt.timestamp).toLocaleString()}</td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', tableRow);
                });
            }
        })
        .catch(error => console.error('Error fetching user attempts:', error));
    });
});