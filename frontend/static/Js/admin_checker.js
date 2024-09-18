document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    // Target the correct containers for teacher exams and reviewed exams
    const teacherExamsContainer = document.getElementById('teacher-exams-container');
    const reviewedExamsContainer = document.getElementById('reviewed-exams-container');

    if (!teacherExamsContainer || !reviewedExamsContainer) {
        console.error('Error: Required containers not found.');
        return;
    }

    // Fetch Teacher Submitted Exams
    fetchExams('/quiz/status/submitted_to_admin/', 'Teacher Submitted Exams', teacherExamsContainer);

    // Fetch Reviewed Exams
    fetchExams('/quiz/status/reviewed_exams/', 'Reviewed Exams', reviewedExamsContainer);

    function fetchExams(apiUrl, headingText, container) {
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                const noExamsMessage = document.createElement('p');
                noExamsMessage.textContent = `No ${headingText.toLowerCase()} available.`;
                noExamsMessage.classList.add('text-center', 'text-muted');
                container.appendChild(noExamsMessage);
                return;
            }

            data.forEach(exam => {
                const examElement = document.createElement('div');
                examElement.classList.add('col');

                // Determine the correct URL based on the exam status
                const checkExamUrl = exam.status === 'reviewed' 
                    ? `/quiz/admin_reviewer/${exam.exam}/` 
                    : `/quiz/exam_check/${exam.exam}/`;

                examElement.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${exam.exam_details['title']}</h5>
                            <p class="card-text">Teacher: ${exam.exam_details['created_by']}</p>
                            <p class="card-text">Total Marks: ${exam.exam_details['total_marks']}</p>
                            <p class="card-text">Last Date: ${exam.exam_details['last_date']}</p>
                        </div>
                        <div class="card-footer d-flex flex-column">
                            <a href="${checkExamUrl}" class="btn btn-primary mb-2">Check Exam</a>
                            ${exam.status === 'reviewed'
                                ? `<button class="btn btn-warning mb-2 publish-exam-btn" pk-id="${exam.id}">Publish Exam</button>`
                                : `<button class="btn btn-success mb-2 assign-teacher-btn" pk-id="${exam.id}">Assign Teacher</button>`
                            }
                            <button class="btn btn-danger delete-btn" data-exam-id="${exam.exam}">Delete Exam</button>
                        </div>
                    </div>
                `;
                container.appendChild(examElement);
            });

            addEventListeners();
        })
        .catch(error => console.error('Error:', error));
    }

    function addEventListeners() {
        document.querySelectorAll('.assign-teacher-btn').forEach(button => {
            button.addEventListener('click', function() {
                const pk = this.getAttribute('pk-id');
                fetchTeachers(pk);
            });
        });

        document.querySelectorAll('.publish-exam-btn').forEach(button => {
            button.addEventListener('click', function() {
                const pk = this.getAttribute('pk-id');
                publishExam(pk);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const examId = this.getAttribute('data-exam-id');
                if (confirm('Are you sure you want to delete this exam?')) {
                    deleteExam(examId);
                }
            });
        });
    }

    function fetchTeachers(pk) {
        fetch('/quiz/teachers', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        })
        .then(response => response.json())
        .then(teachers => {
            showTeacherModal(teachers, pk);
        })
        .catch(error => console.error('Error fetching teachers:', error));
    }

    function deleteExam(examId) {
        fetch(`/quiz/exams/${examId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Exam deleted successfully.');
                window.location.reload();
            } else {
                response.json().then(data => {
                    alert('Error deleting exam: ' + data.error);
                });
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function publishExam(pk) {
        fetch(`/quiz/status/${pk}/publish_exam/`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Exam published successfully.');
                window.location.reload();
            } else {
                response.json().then(data => {
                    alert('Error publishing exam: ' + data.error);
                });
            }
        })
        .catch(error => console.error('Error publishing exam:', error));
    }

    function showTeacherModal(teachers, pk) {
        const modal = new bootstrap.Modal(document.getElementById('teacherModal'), {});
        const modalBody = document.querySelector('#teacherModal .modal-body');
        modalBody.innerHTML = `
            <label for="teacher-select">Select Teacher</label>
            <select id="teacher-select" class="form-control">
                ${teachers.map(teacher => `<option value="${teacher.id}">${teacher.username}</option>`).join('')}
            </select>
            <button class="btn btn-primary mt-3" id="assign-teacher-btn" pk-id="${pk}">Assign</button>
        `;

        document.getElementById('assign-teacher-btn').addEventListener('click', function() {
            const selectedTeacherId = document.getElementById('teacher-select').value;
            assignTeacherToExam(pk, selectedTeacherId);
            modal.hide();
        });

        modal.show();
    }

    function assignTeacherToExam(pk, teacherId) {
        fetch(`/quiz/status/${pk}/assign_reviewer/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ reviewer_id: teacherId })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.detail);
        })
        .catch(error => console.error('Error assigning teacher:', error));
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; cookies.length > i; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
