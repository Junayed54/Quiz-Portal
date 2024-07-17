document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('exam_id');
    let currentQuestionIndex = 0;
    let questions = [];

    function loadQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            document.getElementById('question-text').textContent = question.text;
            const optionsContainer = document.getElementById('options-container');
            optionsContainer.innerHTML = '';
            question.options.forEach(option => {
                const optionButton = document.createElement('button');
                optionButton.textContent = option.text;
                optionButton.classList.add('block', 'w-full', 'bg-gray-200', 'py-2', 'px-4', 'rounded-md', 'my-2', 'hover:bg-gray-300');
                optionButton.addEventListener('click', () => {
                    submitAnswer(question.id, option.id);
                });
                optionsContainer.appendChild(optionButton);
            });
        } else {
            calculateResults();
        }
    }

    function submitAnswer(questionId, optionId) {
        fetch(`/api/exams/${examId}/submit/${questionId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ option_id: optionId })
        })
        .then(response => response.json())
        .then(data => {
            currentQuestionIndex++;
            loadQuestion();
        })
        .catch(error => console.error('Error:', error));
    }

    function calculateResults() {
        fetch(`/api/exams/${examId}/results/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('exam-content').innerHTML = `
                <h2 class="text-2xl font-bold mb-6">Results</h2>
                <p>Correct Answers: ${data.correct_answers}</p>
                <p>Wrong Answers: ${data.wrong_answers}</p>
                <p>Passed: ${data.passed ? 'Yes' : 'No'}</p>
            `;
        })
        .catch(error => console.error('Error:', error));
    }

    fetch(`/api/exams/${examId}/questions/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        questions = data;
        loadQuestion();
    })
    .catch(error => console.error('Error:', error));
});
