document.addEventListener('DOMContentLoaded', function() {
    const viewButtons = document.querySelectorAll('.view-questions');
    const accessToken = localStorage.getItem('access_token');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.dataset.userId;
            window.location.href = `/quiz/questions_by_user/${userId}`;
        });
    });

    // Fetch data (for example, from the API)
    fetch('/quiz/questions/reviewed_users/',{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const tableBody = document.getElementById('user-summary-table');
            tableBody.innerHTML = ''; // Clear any previous content

            if (data.length > 0) {
                data.forEach((item, index) => {
                    // console.log(data[index]['username']);
                    // console.log(item.username);
                    // Create a row for each user
                    const row = `
                        <tr>
                            <th scope="row">${index + 1}</th>
                            <td>${item.username}</td>
                            <td>${item.total_reviewed_questions}</td>
                            <td>
                                <button class="btn btn-primary view-questions" data-user-id="${item.user_id}">View Questions</button>
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            } else {
                // If no data, show a message
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No questions found.</td></tr>';
            }

            // Re-attach event listeners after data is populated
            const newViewButtons = document.querySelectorAll('.view-questions');
            newViewButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const userId = this.dataset.userId;
                    window.location.href = `/quiz/reviewer_questions/${userId}`;
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});