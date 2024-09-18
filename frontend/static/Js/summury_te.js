document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    // console.log("Access token:", accessToken);
    fetch(`/quiz/teachers`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        const teacherSelect = document.getElementById('teachers');
        console.log(teacherSelect);
        
        teacherSelect.innerHTML = '<option selected disabled value="">Choose...</option>'; // Reset options
        const allOption = document.createElement('option');
        allOption.value = 'All';
        allOption.textContent = 'All';
        teacherSelect.appendChild(allOption)
        if (Array.isArray(data)) {
            data.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                // console.log(teacher.id);
                option.textContent = teacher.username;  // Adjust field based on your serializer
                teacherSelect.appendChild(option);
            });
        } else {
            console.error('Unexpected data format:', data);
        }
    })
    .catch(error => console.error('Error loading teachers:', error));
});


document.getElementById('filter-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const userId = formData.get('teacher_id');
    // console.log("user Id", userId);
    const month = formData.get('month');
    const year = formData.get('year');

    fetch(`/quiz/teacher-summury/?user_id=${userId}&month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        const resultDiv = document.getElementById('results');
        resultDiv.innerHTML = ''; // Clear previous results
        console.log(data.total_questions);
        if (data.overall_summary) {
            // Handle the case where user_id is 'all'
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = `
                <h3>Overall Category Summary</h3>
                <ul>
                    ${data.overall_summary.map(cat => `<li>${cat.category_name}: ${cat.question_count} questions</li>`).join('')}
                </ul>
            `;
            resultDiv.appendChild(summaryDiv);
    
            const teachersDiv = document.createElement('div');
            teachersDiv.innerHTML = `<h3>Teachers Summary</h3>`;
            console.log("this is", Array.isArray(data))
            data.individual_teachers.forEach(item => {
                const userDiv = document.createElement('div');
                userDiv.innerHTML = `
                    <h4>${item.username}</h4>
                    <p>Total Questions: ${item.total_questions}</p>
                    <ul>
                        ${item.categories.map(cat => `<li>${cat.category_name}: ${cat.question_count} questions</li>`).join('')}
                    </ul>
                `;
                teachersDiv.appendChild(userDiv);
            });
    
            resultDiv.appendChild(teachersDiv);
        } else {
            // Handle the case where user_id is a specific user
            const userDiv = document.createElement('div');
            userDiv.innerHTML = `
                <h3>${data.username}</h3>
                <p>Total Questions: ${data.total_questions}</p>
                <ul>
                    ${Array.isArray(data.categories) ? data.categories.map(cat => 
                        `<li>${cat.category_name}: ${cat.question_count} questions</li>`
                    ).join('') : '<li>No categories available</li>'}
                </ul>
            `;
            resultDiv.appendChild(userDiv);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
    
    })
    .catch(error => console.error('Error:', error)
);
