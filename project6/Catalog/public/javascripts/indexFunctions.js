// Initialization
$(document).ready(function() {

    // Load session variable data
    loadUser();
    logJSON();
});

async function loadUser() {
    // Print username from session variable
    fetch('/session')
    .then(response => response.json())
        .then(session => {
            const student = $("#studentName");
            const name = session.data.user;
            student.append(" " + name);
    });
}

async function logJSON() {
    const data = await fetch('/getCombined')
    .then(response => response.json())
    .then(data => {
        console.log(JSON.parse(data));
    })
    .catch(error => console.error(error));
    
    const dataReq = await fetch('/getRequirments')
    .then(response => response.json())
    .then(data => {
        console.log(JSON.parse(data));
    })
    .catch(error => console.error(error));
}
