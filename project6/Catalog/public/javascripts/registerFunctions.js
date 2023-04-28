// Initialization
$(document).ready(function() {

    // Load session variable data
    loadAlert();

    // Redirect to login page
    $("#loginButton").click(function(e) {
        e.preventDefault();
        toLogin();
    });

    // Validate username
    $("#username").blur(function(e) {
        e.preventDefault();
        validateUsername();
    });

    // Validate password
    $("#retypedPassword").blur(function(e) {
        e.preventDefault();
        validatePassword();
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

function toLogin() {
    window.location = "/login"
}

async function validateUsername() {
    // Collect form data ([0] gets the DOM object)
    const form = $("#loginForm")[0];
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Make sure that username is in a valid format
    if (!validName(data["username"])) {
        alert(
            "Username must use email syntax." +
            "\nExample: username@email.com"
        );
    } 
    return;
}

async function validatePassword() {
    // Collect form data ([0] gets the DOM object)
    const form = $("#loginForm")[0];
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Check the passwords to make sure they match
    var original = data["password"];
    var retyped = data["retypedPassword"];
    if(original !== retyped) {
        alert("Passwords do not match.");
    } 
    return;
}

function validName(email) {
    const match = email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return match;
};