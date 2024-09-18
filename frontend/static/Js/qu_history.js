document.addEventListener('DOMContentLoaded', function () {
    // Populate the 'year' dropdown with a range of years (e.g., from 2000 to current year)
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Handle form submission
    const form = document.getElementById('question-history-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get selected year and month
        const year = document.getElementById('year').value;
        const month = document.getElementById('month').value;

        if (!year || !month) {
            alert('Please select both year and month');
            return;
        }

        // Fetch question history from the API
        fetch(`/quiz/question-history/?year=${year}&month=${month}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Clear previous results
            const questionList = document.getElementById('question-list');
            questionList.innerHTML = '';

            // Check if there are questions
            if (data.length > 0) {
                data.forEach(question => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('list-group-item');
                    listItem.textContent = `Question: ${question.text} (Created by: ${question.created_by})`;
                    questionList.appendChild(listItem);
                });
            } else {
                const noDataItem = document.createElement('li');
                noDataItem.classList.add('list-group-item', 'text-danger');
                noDataItem.textContent = 'No questions available for the selected month.';
                questionList.appendChild(noDataItem);
            }
        })
        .catch(error => {
            console.error('Error fetching question history:', error);
            alert('Failed to fetch question history.');
        });
    });
});
