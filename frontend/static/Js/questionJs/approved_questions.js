document.addEventListener('DOMContentLoaded', function () {
    const examId = window.location.pathname.split("/")[3];  // Get the exam ID from URL
    const accessToken = window.localStorage.getItem('access_token');
    const apiUrl = `/quiz/questions/${examId}/approved_questions/`;

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
            document.getElementById('correct-answers-list').innerHTML = '<li>No questions available</li>';
            loader.style.display = 'none'; // Hide loader
            return;
        }

        // Hide the loader since the data has been fetched
        loader.style.display = 'none'; 
        
        // Show the publish button if data is available
        const publishButton = document.getElementById('publish-questions-btn');
        publishButton.classList.remove('d-none'); // Display the publish button

        // Select the correct and incorrect answers list elements
        const correctAnswersList = document.getElementById('correct-answers-list');
        const incorrectAnswersList = document.getElementById('incorrect-answers-list');

        // Clear previous content
        correctAnswersList.innerHTML = '';
        incorrectAnswersList.innerHTML = '';

        // Iterate over the questions and categorize them based on whether they have remarks
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

            if (question.remarks) {
                // Append to the incorrect answers list with remarks
                const remarksHTML = `
                    ${questionHTML}
                    <div class="mb-2"><strong>Reviewer Remarks:</strong> ${question.remarks}</div>
                `;
                incorrectAnswersList.innerHTML += remarksHTML;
            } else {
                // Append to the correct answers list
                correctAnswersList.innerHTML += questionHTML;
            }
        });

        // Show the review container if there are any questions
        document.getElementById('review-container').classList.remove('d-none');

        // Add event listener for publish button after content is loaded
        publishButton.addEventListener('click', function() {
            fetch(`/quiz/questions/${examId}/publish_approved/`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question_ids: data.map(q => q.id) }) // Assuming question IDs are required
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                } else {
                    alert(data.message);
                    // Optionally reload or refresh the page or section to reflect the changes
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    })
    .catch(error => {
        console.error('Error fetching approved questions:', error);
        alert('Failed to load approved questions. Please try again later.');
        loader.style.display = 'none';  // Hide loader in case of an error as well
    });
});
