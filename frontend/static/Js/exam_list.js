document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    console.log(accessToken);
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/exams/exam_list', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const examsList = document.getElementById('exams-list');
        examsList.innerHTML = data.map(exam => `
            <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${exam.title}</h5>
                        <p class="card-text">This is a brief description of the exam.</p>
                    </div>
                    <div class="card-footer text-start">
                        <button class="btn btn-primary" onclick="viewExamDetail('${exam.exam_id}')">View Details</button>
                    </div>
                </div>
            </div>
        `).join('');
    })
    .catch(error => console.error('Error:', error));
});

function viewExamDetail(examId) {
    window.location.href = `/quiz/exam_detail/${examId}/`;
}
