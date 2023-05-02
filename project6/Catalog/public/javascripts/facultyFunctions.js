// Initialization
$(document).ready(async function() {

    // Load student and plan data
    const data = await getData();
    await populateStudents(data);

    // Populate plans based on student selected
    $("#students").change(async function(e) {
        e.preventDefault();
        await populatePlans(data);
    });
});

async function getData() {
    // Get student and plan data
    const data = await fetch("/faculty/collect")
    .then(response => response.json())
    .then(json => {
        return json;
    });
    return data;
}

async function populateStudents(data) {
    // Load data into select box(es)
    const selectBox = $("#students");
    const planBox = $("#plans");
    selectBox.append("<option value='' disabled selected>" + "Select a student" + "</option>");
    planBox.append("<option value='' disabled selected>" + "Select a plan" + "</option>");
    for (let student in data) {
        selectBox.append("<option value=" + encodeURIComponent(student) + ">" + student + "</option>");
    }
}

async function populatePlans(data) {
    // Load data into plan box(es)
    const planBox = $("#plans");
    planBox.empty();
    planBox.append("<option value='' disabled selected>" + "Select a plan" + "</option>");
    const studentValue = decodeURIComponent($("#students").val());
    const studentData = data[studentValue];
    for (let i = 0; i < studentData.length; i++) {
        planBox.append("<option value=" + encodeURIComponent(studentData[i]) + ">" + studentData[i] + "</option>");
    }
}