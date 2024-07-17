document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/exams/')
        .then(response => response.json())
        .then(data => {
            const examList = document.getElementById('exam-list');
            data.forEach(exam => {
                const examItem = document.createElement('li');
                examItem.classList.add('p-4', 'border', 'border-gray-300', 'rounded', 'mb-4', 'cursor-pointer', 'hover:bg-gray-100');
                examItem.textContent = exam.title;
                examItem.addEventListener('click', () => {
                    window.location.href = `/exam_detail.html?exam_id=${exam.exam_id}`;
                });
                examList.appendChild(examItem);
            });
        });
});
