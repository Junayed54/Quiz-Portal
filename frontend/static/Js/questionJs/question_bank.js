document.addEventListener('DOMContentLoaded', function () {
    // const examId = window.location.pathname.split("/")[3];  // Get the exam ID from URL
    const accessToken = window.localStorage.getItem('access_token');
    const apiUrl = `/quiz/questions/question_bank/`;

    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    // Show loader while fetching data
    const loader = document.getElementById('loading');
    loader.style.display = 'block';  // Show the loader

    // Fetch approved questions
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        // Ensure data is available and is an array
        if (!Array.isArray(data) || data.length === 0) {
            console.error('No questions found in the data');
            document.getElementById('question-list').innerHTML = '<li>No questions available</li>';
            loader.style.display = 'none'; // Hide loader
            return;
        }

        // Hide the loader since the data has been fetched
        loader.style.display = 'none'; 
        
        // Select the correct question list element
        const questionList = document.getElementById('question-list');

        // Clear previous content
        questionList.innerHTML = '';

        // Iterate over the questions
        data.forEach((question, index) => {
            // Construct HTML for each question and options
            const questionHTML = `
                <li class="list-group-item">
                    <strong>Question ${index + 1}:</strong> ${question.text}
                    <ul class="mt-2">
                        ${question.options.map(option => `
                            <li>${option.text} ${option.is_correct ? '<span class="badge bg-success">Correct</span>' : ''}</li>
                        `).join('')}
                    </ul>
                </li>
            `;
            questionList.innerHTML += questionHTML;
        });

        // Show the review container if there are any questions
        document.getElementById('review-container').classList.remove('d-none');
    })
    .catch(error => {
        console.error('Error fetching approved questions:', error);
        loader.style.display = 'none';  // Hide loader in case of an error
    });
});
