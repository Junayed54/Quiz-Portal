document.addEventListener('DOMContentLoaded', function () {
    const examId = window.location.pathname.split("/")[3]; // Get examId from URL
    const accessToken = window.localStorage.getItem('access_token');
    const apiUrl = `/quiz/exams/exam_detail/${examId}/`;

    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    // Fetch exam details
    fetch(apiUrl, { 
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Hide the loading spinner
        document.getElementById('loading').classList.add('d-none');

        // Populate Exam Info
        document.getElementById('created-by').innerText = data.created_by;
        document.getElementById('exam-title').textContent = data.title;
        document.getElementById('total-questions').textContent = data.total_questions;
        document.getElementById('generated-questions').textContent = data.questions_to_generate;
        document.getElementById('exam-info').classList.remove('d-none');

        // Populate Questions and Options
        const questionsList = document.getElementById('questions-list');
        data.questions.forEach((question, index) => {
            // Create a div for each question
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('mb-4');

            // Generate options list with a status switch and remarks textarea
            const optionsHTML = question.options.map(option => `
                <li class="list-group-item">
                    ${option.text} ${option.is_correct ? '<span class="badge badge-success">Correct</span>' : ''}
                </li>
            `).join('');

            questionDiv.innerHTML = `
                <h5>Question ${index + 1}: ${question.text}</h5>
                <ul class="list-group">${optionsHTML}</ul>
                <label for="status-${question.id}">Status:</label>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="status-${question.id}" onchange="toggleRemarks(${question.id})">
                    <label class="form-check-label" for="status-${question.id}">No/Yes</label>
                </div>
                <div id="remarks-container-${question.id}" class="d-none mt-2">
                    <label for="remarks-${question.id}">Remarks:</label>
                    <textarea id="remarks-${question.id}" class="form-control" placeholder="Enter remarks here..."></textarea>
                </div>
            `;

            questionsList.appendChild(questionDiv);
        });

        document.getElementById('questions-container').classList.remove('d-none');

        // Add submit button to send the exam back to the admin
        const submitButton = document.createElement('button');
        submitButton.classList.add('btn', 'btn-primary', 'mt-4');
        submitButton.textContent = 'Submit Exam to Admin';
        submitButton.onclick = () => submitExamToAdmin(data.status_id); // Pass status_pk
        document.getElementById('questions-container').appendChild(submitButton);
    })
    .catch(error => {
        console.error('Error fetching exam details:', error);
        alert('Failed to load exam details. Please try again later.');
    });
});

// Function to toggle the visibility of the remarks field
function toggleRemarks(questionId) {
    const status = document.getElementById(`status-${questionId}`).checked;
    const remarksContainer = document.getElementById(`remarks-container-${questionId}`);
    if (status) { // If 'Yes' is selected (toggle is checked)
        remarksContainer.classList.remove('d-none');
    } else {
        remarksContainer.classList.add('d-none');
    }
}

// Function to submit the exam to admin
function submitExamToAdmin(statusPk) {
    const accessToken = window.localStorage.getItem('access_token');

    // Collect the status and remarks for each question
    const questionsList = document.querySelectorAll('#questions-list > div');
    const questionsData = Array.from(questionsList).map((questionDiv) => {
        const questionId = questionDiv.querySelector('input.form-check-input').id.split('-')[1];
        // const status = document.getElementById(`status-${questionId}`).checked;
        const remarks = document.getElementById(`remarks-${questionId}`).value;
        return {
            question_id: questionId, // Use actual question ID
            // status: status,
            remarks: remarks || ''
        };
    });

    // API URL to submit the reviewed exam (now using statusPk)
    const submitApiUrl = `/quiz/status/${statusPk}/submit_to_admin_from_reviewer/`;

    // Make a POST request to submit the exam
    fetch(submitApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({ questions: questionsData })
    })
    .then(response => {
        if (response.ok) {
            alert('Exam successfully submitted to admin');
            window.location.href = '/quiz/reviewer_exams/';
        } else {
            throw new Error('Failed to submit exam');
        }
    })
    .catch(error => {
        console.error('Error submitting exam:', error);
        alert('Failed to submit exam. Please try again later.');
    });
}
