document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch assigned exams
    function fetchAssignedExams() {
        fetch('/quiz/status/my_assigned_exams/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token'),  // Assuming JWT token is stored in localStorage
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            populateExams(data);
        })
        .catch(error => {
            console.error('Error fetching exams:', error);
        });
    }

    // Function to dynamically populate the exams
    function populateExams(exams) {
        const examsContainer = document.getElementById('exams-container');
        examsContainer.innerHTML = '';  // Clear any existing content

        if (exams.length === 0) {
            examsContainer.innerHTML = '<p class="text-center">No exams assigned for review.</p>';
            return;
        }

        exams.forEach(exam => {
            const examCard = `
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${exam.exam_details['title']}</h5>
                            <p class="card-text">
                                <strong>Total Questions:</strong> ${exam.exam_details['total_questions']}<br>
                                <strong>Total Marks:</strong> ${exam.exam_details['total_marks']}<br>
                            </p>
                            <a href="/quiz/exam_check/${exam.exam}/" class="btn btn-primary">Review Exam</a>
                        </div>
                    </div>
                </div>
            `;
            examsContainer.innerHTML += examCard;
        });
    }

    // Call the function to fetch and display the exams
    fetchAssignedExams();
});