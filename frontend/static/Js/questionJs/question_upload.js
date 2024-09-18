document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const accessToken = localStorage.getItem('access_token');
    fetch('/quiz/questions/upload_questions/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Questions uploaded successfully.');
            window.location.href = '/quiz/user_questions/'
        }
    })
    .catch(error => {
        alert('An error occurred while uploading questions.');
        console.error(error);
    });
});