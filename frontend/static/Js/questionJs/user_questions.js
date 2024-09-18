function fetchUserQuestions() {
    const accessToken = localStorage.getItem('access_token');

    fetch('/quiz/questions/user_questions/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { // Get the text (HTML) of the error
                console.error("Error response:", text);
                throw new Error("Failed to fetch questions.");
            });
        }
        return response.json(); // If it's OK, then parse as JSON
    })
    .then(data => {
        const questionsContainer = document.getElementById('questions-container').querySelector('.card-body');
        questionsContainer.innerHTML = '';  // Clear previous questions

        if (data.length > 0) {
            console.log(data);
            data.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('mb-4', 'border-bottom', 'pb-3');

                // Display Question Text
                const questionText = document.createElement('h5');
                questionText.classList.add('mb-3', 'font-weight-bold');
                questionText.textContent = question.text;
                questionDiv.appendChild(questionText);

                // Display Options
                const optionsList = document.createElement('ul');
                optionsList.classList.add('list-group', 'mb-2');

                question.options.forEach(option => {
                    const optionItem = document.createElement('li');
                    optionItem.classList.add('list-group-item');

                    // Check if the option is correct
                    if (option.is_correct) {
                        optionItem.innerHTML = `${option.text} <span class="badge badge-success">&#10003;</span>`; // Correct answer with checkmark
                    } else {
                        optionItem.textContent = option.text;  // Incorrect answer
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
            noQuestionsText.textContent = "You haven't uploaded any questions yet.";
            questionsContainer.appendChild(noQuestionsText);
        }
    })
    .catch(error => {
        console.error("Error fetching questions:", error);
    });
}

window.onload = fetchUserQuestions;
