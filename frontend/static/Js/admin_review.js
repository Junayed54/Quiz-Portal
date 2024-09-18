document.addEventListener('DOMContentLoaded', function () {
            const examId = window.location.pathname.split("/")[3];
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
                // Hide loading spinner
                document.getElementById('loading').classList.add('d-none');

                // Populate Exam Info
                document.getElementById('created-by').textContent = data.created_by;
                document.getElementById('exam-title').textContent = data.title;
                document.getElementById('total-questions').textContent = data.total_questions;
                document.getElementById('generated-questions').textContent = data.questions_to_generate;
                document.getElementById('exam-info').classList.remove('d-none');

                // Populate Correct and Incorrect Answers
                const correctAnswersList = document.getElementById('correct-answers-list');
                const incorrectAnswersList = document.getElementById('incorrect-answers-list');

                data.questions.forEach((question, index) => {
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

                    if (!question.remarks) {
                        correctAnswersList.innerHTML += questionHTML;
                    } else {
                        const remarksHTML = `
                            ${questionHTML}
                            <div class="mt-2"><strong>Reviewer Remarks:</strong> ${question.remarks}</div>
                        `;
                        incorrectAnswersList.innerHTML += remarksHTML;
                    }
                });

                // Show review and action containers
                document.getElementById('review-container').classList.remove('d-none');
                document.getElementById('actions-container').classList.remove('d-none');
            })
            .catch(error => {
                console.error('Error fetching exam details:', error);
                alert('Failed to load exam details. Please try again later.');
            });
        });

        // Handle Publish and Return buttons
        document.getElementById('publish-exam-btn').addEventListener('click', function () {
            alert('Exam Published');
            // You can implement the backend call for publishing here
        });

        document.getElementById('return-exam-btn').addEventListener('click', function () {
            alert('Exam Returned to Maker');
            // You can implement the backend call for returning to exam maker here
        });