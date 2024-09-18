document.addEventListener('DOMContentLoaded', function() {
    fetch('/quiz/questions/get_remarks/')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const tableBody = document.getElementById('remarks-table-body');
            tableBody.innerHTML = ''; // Clear the table body

            data.forEach(item => {
                console.log(item.updated_at);
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${item.created_by}</td>
                    <td>${item.text}</td>
                    <td>${item.remarks}</td>
                    <td>${item.difficulty_level}</td
                    <td>${new Date(item.updated_at).toLocaleDateString()} ${new Date(item.updated_at).toLocaleTimeString()}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching remarks:', error));
});