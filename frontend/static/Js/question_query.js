 
 
 // Fetch the list of teachers when the page loads


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

        if (Array.isArray(data)) {
            data.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = teacher.username;  // Adjust field based on your serializer
                teacherSelect.appendChild(option);
            });
        } else {
            console.error('Unexpected data format:', data);
        }
    })
    .catch(error => console.error('Error loading teachers:', error));
});

// Handle the filter form submission
document.addEventListener("DOMContentLoaded", function () {
    // Attach the form submit event
    const form = document.getElementById("filter-form");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent the default form submission behavior

        // Capture the form data
        const formData = new FormData(form);
        const teacherId = formData.get("teacher_id");
        const month = formData.get("month");
        const year = formData.get("year");

        // Log or process the data
        // console.log("Teacher ID:", teacherId);
        // console.log("Month:", month);
        // console.log("Year:", year);

        const queryParams = new URLSearchParams({
            teacher_id: teacherId,
            month: month,
            year: year,
        }).toString()

        // Optionally, make an AJAX request to filter data
        fetch(`/quiz/teacher-history/?${queryParams}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response data (e.g., update the table)
            populateTable(data);
        })
        .catch(error => console.error("Error:", error));
    });

    // Function to populate table dynamically
    function populateTable(data) {
        const tableBody = document.getElementById("question-history");
        tableBody.innerHTML = ""; // Clear previous data

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.text}</td>
                <td>${item.category_name}</td>
                <td>${item.marks}</td>
                <td>${item.difficulty_level}</td>
                
            `;
            tableBody.appendChild(row);
        });
    }
});