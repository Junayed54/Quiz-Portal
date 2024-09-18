document.addEventListener('DOMContentLoaded', function() {
    const accessToken = window.localStorage.getItem('access_token');
    
    const id = window.location.href.split('/')[5]; // Replace with dynamic user ID
    // console.log("User ID:", id);

    // Fetch reviewed questions from the server
    fetch(`/quiz/questions/${id}/reviewed_questions/`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Fetched Data:", data);  // Log the fetched data to check its structure
        document.getElementById('loading-message').classList.add('d-none'); // Hide loading message
        const questionsList = document.getElementById('questions-list');

        // Check if the data is an array or contains questions
        const questions = Array.isArray(data) ? data : data.questions;

        // Ensure questions exist
        if (!questions || questions.length === 0) {
            questionsList.innerHTML = "<p>No questions found.</p>";
            return;
        }

        questions.forEach((question, index) => {
            // console.log("Processing Question:", question); // Debugging log for each question
            // Create a div for each question
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('mb-4');

            // Generate options list
            const optionsHTML = question.options.map(option => {
                return `
                    <li class="list-group-item">
                        ${option.text} ${option.is_correct ? '<span class="badge badge-success">Correct</span>' : ''}
                    </li>
                `;
            }).join('');

            // Find the correct answer
            const correctOption = question.options.find(option => option.is_correct);
            const correctAnswerHTML = correctOption 
                ? `<p class="mt-2"><strong>Correct Answer:</strong> ${correctOption.text}</p>`
                : `<p class="mt-2 text-danger"><strong>No correct answer provided</strong></p>`;

            // Populate the question div with options and the correct answer
            questionDiv.innerHTML = `
                <h5>Question ${index + 1}: ${question.text}</h5>
                <h6>Difficulty level: ${question.difficulty_level}</h6>
                <ul class="list-group">${optionsHTML}</ul>
                ${correctAnswerHTML}
                <label for="status-${question.id}">Status:</label>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="status-${question.id}" onchange="toggleRemarks(${question.id})">
                    <label class="form-check-label" for="status-${question.id}">Off/On</label>
                </div>
                <div id="remarks-container-${question.id}" class="mt-2 d-none">
                    <label for="remarks-${question.id}">Remarks:</label>
                    <textarea id="remarks-${question.id}" class="form-control" placeholder="Enter remarks here...">${question.remarks || ''}</textarea>
                </div>
            `;

            questionsList.appendChild(questionDiv);
        });

        // Add a single submit button at the end
        const submitButton = document.createElement('button');
        submitButton.classList.add('btn', 'btn-primary', 'mt-3');
        submitButton.innerText = 'Submit All Reviews';
        submitButton.onclick = submitAllReviews;
        questionsList.appendChild(submitButton);

        document.getElementById('questions-container').classList.remove('d-none');
    })
    .catch(error => {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions. Please try again later.');
    });
});

// Function to toggle the visibility of the remarks field based on the switch status
function toggleRemarks(questionId) {
    const status = document.getElementById(`status-${questionId}`).checked;
    const remarksContainer = document.getElementById(`remarks-container-${questionId}`);
    
    if (status) { // If switch is turned on (checked), show remarks
        remarksContainer.classList.remove('d-none');
    } else { // If switch is off, hide remarks
        remarksContainer.classList.add('d-none');
    }
}

// Function to collect and submit all reviews
function submitAllReviews() {
    const accessToken = window.localStorage.getItem('access_token');
    const questionsList = document.querySelectorAll('[id^="status-"]');
    const reviews = [];

    // Collect all the review data from the form
    questionsList.forEach((statusElement) => {
        const questionId = statusElement.id.split('-')[1];
        const remarks = document.getElementById(`remarks-${questionId}`).value;

        reviews.push({
            question_id: questionId,
            remarks: remarks
        });
    });

    // Make a single POST request to submit all the reviews
    fetch('/quiz/questions/submit_all_reviews/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({ reviews: reviews })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            alert('Failed to submit reviews. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error submitting reviews:', error);
        alert('Failed to submit reviews. Please try again later.');
    });
}
