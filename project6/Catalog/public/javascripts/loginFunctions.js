// Initialization
$(document).ready(function() {

    // Load session variable data
    loadAlert();

    // Redirect to register page
    $("#registerButton").click(function(e) {
        e.preventDefault();
        toRegister();
    });
});

async function loadAlert() {
    // Print alert from session variable
    fetch('/session')
    .then(response => response.json())
        .then(session => {
            const alertBox = $("#alert");
            const alert = session.data.alert;
            alertBox.text(alert);

            // We want the variable to disappear after usage
            const key = "alert";
            fetch("/session/remove?key=" + key);
    });
}

function toRegister() {
    window.location = "/register"
}