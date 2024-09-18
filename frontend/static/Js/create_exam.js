document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    const questionsSection = document.getElementById('questions-section');
    const createExamBtn = document.getElementById('create-exam-btn');
    const uploadExcelBtn = document.getElementById('upload-excel-btn');
    const fileInput = document.getElementById('upload-excel');
    const exelForm = document.getElementById('exel-form');
    const generateQuestionsBtn = document.getElementById('generate-questions-btn');
    createExamBtn.addEventListener('click', async function() {
        const form = document.getElementById('create-exam-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/quiz/exams/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                form.dataset.examId = result.exam_id;


                const examId = document.getElementById('create-exam-form').dataset.examId;
                const difficultyInputs = document.querySelectorAll('input[id^="difficulty"]');

                // Collect difficulty data
                const difficultyData = {
                    exam: examId
                };

                difficultyInputs.forEach(input => {
                    difficultyData[input.name] = input.value;
                });

                // Send difficulty data to the server
                try {
                    const response = await fetch('/quiz/add-exam-difficulty/', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(difficultyData),
                    });

                    if (response.ok) {
                        console.log('Difficulty percentages updated successfully!');
                    } else {
                        const result = await response.json();
                        console.error('Failed to update difficulty percentages:', result);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }


                exelForm.classList.remove('d-none');

                alert('Exam created successfully!');
            } else {
                alert('Failed to create exam.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    uploadExcelBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        const examId = document.getElementById('create-exam-form').dataset.examId;

        if (!file || !examId) {
            alert('Please select an Excel file and create an exam first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('exam_id', examId);

        try {
            const response = await fetch('/quiz/upload-excel/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                questionsSection.classList.add('hidden');
                alert('Excel file processed successfully!');
                window.location.href = '/quiz/user_exams/';
            } else {
                console.error('Error processing Excel file:', result);
                alert('Failed to process Excel file.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the Excel file.');
        }
    });


    generateQuestionsBtn.addEventListener('click', async function() {
        const exam_Id = document.getElementById('create-exam-form').dataset.examId;
        const totalQuestions = document.getElementById('questions_to_generate').value;
    
        // Collect difficulty percentage inputs from the form
        const difficultyData = {
            difficulty1: document.getElementById('difficulty1_percentage').value || 0,
            difficulty2: document.getElementById('difficulty2_percentage').value || 0,
            difficulty3: document.getElementById('difficulty3_percentage').value || 0,
            difficulty4: document.getElementById('difficulty4_percentage').value || 0,
            difficulty5: document.getElementById('difficulty5_percentage').value || 0,
            difficulty6: document.getElementById('difficulty6_percentage').value || 0,
        };
    
        if (!exam_Id || !totalQuestions) {
            alert('Please provide the exam ID and the number of questions to generate.');
            return;
        }
    
        try {
            const response = await fetch(`/quiz/exams/${exam_Id}/generate_exam/`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    
                    total_questions: totalQuestions,
                    difficulty: difficultyData  // Send difficulty data with the request
                }),
            });
    
            const result = await response.json();
            if (response.ok) {
                alert('Exam generated successfully!');
                console.log(result.questions);  // List of question IDs
            } else {
                console.error('Error generating exam:', result);
                alert('Failed to generate exam.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating the exam.');
        }
    });
    




    // Adding a new question form dynamically
    document.getElementById('add-question-btn').addEventListener('click', function() {
        const questionsContainer = document.getElementById('questions-container');
        const questionItem = document.querySelector('.question-item.hidden').cloneNode(true);

        questionItem.classList.remove('hidden');
        questionsContainer.appendChild(questionItem);
    });

    // Adding a new option dynamically
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-option-btn')) {
            const optionsContainer = event.target.previousElementSibling;

            // Clone the first option item and clear its values
            const newOptionItem = optionsContainer.querySelector('.option-item').cloneNode(true);
            newOptionItem.querySelector('input[name="option_text"]').value = '';
            newOptionItem.querySelector('input[name="is_correct"]').checked = false;

            optionsContainer.appendChild(newOptionItem);
        }
    });

    // Calculate and update last difficulty level automatically
    const difficultyInputs = document.querySelectorAll('[id^="difficulty"]');
    const lastDifficultyInput = document.getElementById('difficulty6_percentage');
    const difficulty6Hint = document.getElementById('difficulty6_hint');
    
    difficultyInputs.forEach(input => {
        input.addEventListener('input', updateLastDifficulty);
    });

    function updateLastDifficulty() {
        let totalPercentage = 0;

        difficultyInputs.forEach(input => {
            if (input !== lastDifficultyInput) {
                totalPercentage += parseInt(input.value) || 0;
            }
        });

        // Check if the last difficulty input is manually adjusted
        const isLastDifficultyManual = lastDifficultyInput.value && lastDifficultyInput.value !== '';

        if (!isLastDifficultyManual) {
            const remainingPercentage = 100 - totalPercentage;
            totalPercentage += remainingPercentage
            lastDifficultyInput.value = Math.max(0, remainingPercentage);
            difficulty6Hint.textContent = 'This field is calculated automatically based on other difficulties.';
        } else {
            difficulty6Hint.textContent = 'You have manually set this value.';
        }
    }

    // Initialize the hint text
    updateLastDifficulty();

    // Handle difficulty percentage submission
    document.getElementById('submit-all-btn').addEventListener('click', async function() {
        

        // Submit questions
        for (let form of questionForms) {
            const formData = new FormData(form);
            formData.append('exam', examId);

            const options = [];
            form.querySelectorAll('.option-item').forEach(option => {
                options.push({
                    text: option.querySelector('input[name="option_text"]').value,
                    is_correct: option.querySelector('input[name="is_correct"]').checked,
                });
            });

            // Include difficulty level from form input
            const difficultyLevel = form.querySelector('select[name="difficulty_level"]').value;

            const data = Object.fromEntries(formData);
            data.options = options;
            data.difficulty_level = difficultyLevel;

            try {
                const response = await fetch('/quiz/questions/', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                if (!response.ok) {
                    console.error('Error creating question:', result);
                    alert('Failed to create question.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while creating the question.');
            }
        }

        alert('All questions submitted successfully!');
    });
});
