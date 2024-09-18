// Fetch and display the list of teachers
function fetchTeachers() {
    const accessToken = localStorage.getItem('access_token');
    const url = window.location.pathname.split('/');
    const userid = url[url.length - 2];
    fetch('/quiz/teachers/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        const teacherSelect = document.getElementById('teacher-select');
        teacherSelect.innerHTML = '<option value="">Select a teacher</option>'; // Add a default option

        data.forEach(teacher => {
            if(parseInt(userid)===teacher.id) return;
            const option = document.createElement('option');
            option.value = teacher.id; // Use username for selection
            option.textContent = teacher.username; // Display username
            teacherSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching teachers:', error));
}

// Variable to hold the fetched question IDs
let questionIds = [];

// Send selected teacher username and assign them to fetched questions
function sendTeacher() {
    const accessToken = localStorage.getItem('access_token');
    const teacherId = document.getElementById('teacher-select').value;
    console.log(teacherId);

    if (!teacherId) {
        alert('Please select a teacher.');
        return;
    }

    if (questionIds.length === 0) {
        alert('No questions found to assign.');
        return;
    }

    fetch('/quiz/questions/assign_teacher/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            teacherId: teacherId,
            question_ids: questionIds
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                console.error('Error assigning teacher:', data);
                alert('Failed to assign teacher.');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Teacher assigned to all questions successfully.');
        console.log(data);
    })
    .catch(error => console.error('Error sending teacher:', error));
}

// Fetch user questions and store their IDs
function fetchUserQuestions() {
    const accessToken = localStorage.getItem('access_token');
    const urlParts = window.location.pathname.split('/');
    const id = urlParts[urlParts.length - 2];

    fetch(`/quiz/questions/submitted_questions/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                console.error("Error response:", text);
                throw new Error("Failed to fetch questions.");
            });
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const questionsContainer = document.getElementById('questions-container').querySelector('.card-body');
        questionsContainer.innerHTML = '';  // Clear previous questions

        // Clear the previous questionIds
        questionIds = [];

        if (data.length > 0) {
            data.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('mb-4', 'border-bottom', 'pb-3');

                // Store the question ID
                questionIds.push(question.id);

                // Display Question Text
                const questionText = document.createElement('h5');
                questionText.classList.add('mb-3', 'font-weight-bold');
                questionText.textContent = question.text;
                questionDiv.appendChild(questionText);

                // Display Options and Mark Correct Answer
                const optionsList = document.createElement('ul');
                optionsList.classList.add('list-group', 'mb-2');

                question.options.forEach(option => {
                    const optionItem = document.createElement('li');
                    optionItem.classList.add('list-group-item');

                    // Check if the option is correct
                    if (option.is_correct) {
                        optionItem.innerHTML = `${option.text} <span class="badge badge-success">&#10003; Correct Answer</span>`;
                    } else {
                        optionItem.textContent = option.text;
                    }

                    optionsList.appendChild(optionItem);
                });

                questionDiv.appendChild(optionsList);

                // Display Difficulty Level
                const difficultyText = document.createElement('p');
                difficultyText.classList.add('text-muted', 'mb-1');
                difficultyText.textContent = `Difficulty Level: ${question.difficulty_level}`;
                questionDiv.appendChild(difficultyText);

                // Display Category
                const categoryText = document.createElement('p');
                categoryText.classList.add('text-muted');
                categoryText.textContent = `Category: ${question.category_name}`;
                questionDiv.appendChild(categoryText);

                // Append to Container
                questionsContainer.appendChild(questionDiv);
            });
        } else {
            const noQuestionsText = document.createElement('p');
            noQuestionsText.classList.add('text-muted');
            noQuestionsText.textContent = "No questions have been submitted.";
            questionsContainer.appendChild(noQuestionsText);
        }
    })
    .catch(error => {
        console.error("Error fetching questions:", error);
    });
}

window.onload = () => {
    if (document.getElementById('teacher-select')) {
        fetchTeachers();
    }

    if (document.getElementById('questions-container')) {
        fetchUserQuestions();
    }
};
