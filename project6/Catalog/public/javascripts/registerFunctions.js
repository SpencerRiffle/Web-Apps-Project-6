
// Initialization
$(document).ready(function() {
    console.log("Running register functions...");
    $("#retypedPassword").blur(validate);
});


function validate() {
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
        // Prevent submission
        event.preventDefault();
        alert("Passwords do not match.");
        return;
    } 
    else {
        return;
    }
}