document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('exam_id');

    fetch(`/api/exams/${examId}/`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('exam-title').textContent = data.title;
            document.getElementById('start-exam-btn').addEventListener('click', () => {
                fetch(`/api/exams/${examId}/start/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    window.location.href = `/start_exam.html?exam_id=${examId}`;
                })
                .catch(error => console.error('Error:', error));
            });
        });
});
