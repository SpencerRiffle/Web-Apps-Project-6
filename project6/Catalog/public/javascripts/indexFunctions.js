// Initialization
$(document).ready(function() {

    // Load session variable data
    loadUser();
});

async function loadUser() {
    // Print username from session variable
    fetch('/session')
    .then(response => response.json())
        .then(session => {
            const student = $("#studentName");
            const name = session.user;
            student.append(" " + name);
    });
}