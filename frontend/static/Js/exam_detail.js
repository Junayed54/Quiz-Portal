document.addEventListener('DOMContentLoaded', function() {
    const examId = window.location.pathname.split('/')[3];
    const startButton = document.getElementById("start-exam");
    const leaderboardButton = document.getElementById("leaderboard");

    // Fetch user's role
    fetch('/auth/user-role/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    .then(response => response.json())
    .then(roleData => {
        if (roleData.role) {
            // Fetch exam details if user is a student
            fetch(`/quiz/exams/exam_detail/${examId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                document.getElementById('exam-title').textContent = data.title;
                document.getElementById('total-questions').textContent = data.total_questions;
                document.getElementById('total-marks').textContent = data.total_marks;
                document.getElementById('score').textContent = data.correct_answers;
                document.getElementById('attempt-count').textContent = data.user_attempt_count;
                startButton.classList.remove('d-none'); // Show start button for students
            })
            .catch(error => {
                console.error('Error fetching exam details:', error);
            });
        }
        startButton.classList.add('d-none'); // Show start button for students
        // leaderboardButton.classList.remove('d-none'); // Always show leaderboard button
    })
    .catch(error => {
        console.error('Error fetching user role:', error);
    });

    startButton.addEventListener('click', function() {
        startExam(examId);
    });

    leaderboardButton.addEventListener('click', function() {
        leaderBoard(examId);
    });
    
    function startExam(examId) {
        window.location.href = `/quiz/start_exam/${examId}/`;
    }

    function leaderBoard(examId){
        window.location.href = `/quiz/leader_board/${examId}/`;
    }
});