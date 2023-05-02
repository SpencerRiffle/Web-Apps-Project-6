// Initialization
$(document).ready(function () {
    
    // Load session variable data
    loadUser();
    logJSON();
    makeFireFlies();
    $("#logout").click(async function(e) {
        e.preventDefault();
        await logout();
    });
});

async function logout() {
    fetch('/logout')
        .then(response => response.json())
        .then(data => {
            return JSON.parse(data);
        });
    window.location.href = '/login';
}

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
            return JSON.parse(data);
        });
    return data;
}

async function logJSONgetReq() {
    const data = await fetch('/getRequirments')
        .then(response => response.json())
        .then(data => {
            return JSON.parse(data);
        });
    return data;
}
//begin code copied from project 5:

// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

loadAccordion();
async function loadAccordion() {
    reqs = logJSONgetReq();
    console.log(reqs);
    // Variables to store text'
    let categories
    let core;
    let cognates;
    let elective;
    let genEds;
    await reqs.then(function (result) {
        // Variables to store text
        categories = result.categories;
        cognates = result.categories.Cognates;
        core = result.categories.Core;
        elective = result.categories.Elective;
        genEds = result.categories.GenEds;
    });

    let data = logJSON();
    let catalog;
    await data.then(function (result) {
        catalog = result.catalog.courses;
    });

    let requirements = $("#accordion");
    // Create the accordion widget
    $(function () {
        requirements.accordion();
    });

    // Populate accordion
    for (const category in categories) {
        // Create header block
        console.log(category);
        requirements.append("<h3>" + category.charAt(0).toUpperCase() + category.substring(1) + "</h3>");
        courses = $("<div>");

        // Add classes to block
        categories[category].forEach(function (course) {
            //console.log(catalog[course].credits);
            let p = $("<p>").addClass('planned addable');
            p.append("<img>" + course + " " + catalog[course].name + "<span style='display: none;'>" + catalog[course].credits + "</span>");
            courses.append(p);
        });
        requirements.append(courses);
    }
    
    refreshFunctionality();
}

let cSearch = $("#cSearch");
cSearch.on("input", onInput);

async function onInput() {
    let data = logJSON();
    let courseList;
    await data.then(function (response) {
        courseList = response.catalog.courses;
    });
    let input = cSearch.val();
    console.log(input);
    $("#courseId").empty();
    $("#courseName").empty();
    $("#courseDescription").empty();
    $("#courseCredits").empty();


    for (const corse in courseList) {
        let temp = courseList[corse];
        let id = temp.id;
        let cName = courseList[id].name;
        let cred = courseList[id].credits;
        let desc = courseList[id].description;

        cred = cred.toString();
        if (id.includes(input.toUpperCase()) || cName.toUpperCase().includes(input.toUpperCase()) || desc.toUpperCase().includes(input.toUpperCase()) || cred.toUpperCase().includes(input.toString().toUpperCase())) {
            $("#courseId").append("<div class='addable1'>" + id
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");

            $("#courseName").append("<div class='addable1'>" + cName
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");

            $("#courseCredits").append("<div class='addable1'>" + cred
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");

            $("#courseDescription").append("<div class='addable1'>" + desc
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");
        }
    }
    refreshFunctionality();
}

//save button applies changeLog to database.
$("#save").click(function(){
    //send changeLog to server-side script to save to db
    //send notes content to server-side

});

$("#addYear").click(function(){

});
$("#delYear").click(function(){
    
});

async function makeFireFlies() {
    console.log("Generating fireflies...");
    const numFireFlies = 12;
    const jar = $('ul.fireflies');

    for (let i = 0; i < numFireFlies; i++) {
        const li = $('<li></li>').css('z-index', '-1');;
        jar.append(li);
    }
    blink();
}

async function blink() {
    let numBlinks = 3000;
    for(let i = 0; i < numBlinks; i++) {
        $(".fireflies li").each(async function(){
            if (i == numBlinks - 1) {
                $(this).fadeTo(300, 0);
            }
            else if (Math.random() > 0.5) {
                $(this).fadeTo(300, 0);
            }
            else {
                $(this).fadeTo(300, 1);
            }
            await delay((Math.random() * 3000));
        });
    }
}
    
//begin code copied from project 5:
window.onload = function () {
    refreshFunctionality();
}

//This allows newly generated elements to become draggable
function refreshFunctionality() {
    checkReqs();
    
    //draggable elements from the Plan in th UR
    $(".draggable").draggable({
        start: function (event, ui) {
            ui.helper.data('dropped', false);
            ui.helper.data('sem', event.target.parentNode.id);
            ui.helper.attr('semId', ui.helper.data('sem'));
            ui.helper.css("display", "none");
        },
        drag: function (){
            $("body").css("cursor", "url('/img/cursor.png') 64 64, auto"); //to signify drag
        },
        stop: function (event, ui) {
            //Check value of ui.helper.data('dropped') and delete if not in droppable
            if (ui.helper.data('dropped') == false) {
                $(this).remove();
                $("#changeLog").append("DEL " + ui.helper.attr('semId') + " " + ui.helper.text() + "\n");
                console.log($("#changeLog").text());
                checkReqs();
                calcCredits();
            }
        }
    });
    
    //make semesters accept dragged courses and update change log
    $(".semester").droppable({
        drop: function (event, ui) {
            $("#changeLog").append("DEL " + $(ui.draggable).parent().attr("id") + " " + ui.helper.text() + "\n"); //add remove entry to change log from old semester
            $("#changeLog").append("ADD " + this.id + " " + ui.helper.text() + "\n"); //add entry to change log. Save button modifies db
            console.log($("#changeLog").text());
            if (ui.draggable.hasClass("draggable")) {
                ui.helper.data('dropped', true);  //sucessfully dropped
                ui.draggable.attr("style", "position: relative;").appendTo(this); //append to this semester
            }
            //addable's are elements from the accordion in the UL
            else if (ui.draggable.hasClass("addable")) {
                $(ui.draggable).clone()
                .addClass("draggable course")
                .removeClass("addable planned")
                .attr("style", "position: relative;")
                    .appendTo(this).children("img").remove(); //remove req icon
                }
            else {
                $(ui.draggable).children('p').clone()
                .addClass("draggable course")
                .removeClass("addable1")
                .attr("style", "position: relative;")
                .appendTo(this);
            }
            calcCredits();
            checkReqs();
            refreshFunctionality();
        }
    });
    
    $(".addable").draggable({
        helper: "clone",
        start: function (event, ui) {
            ui.helper.children("img").remove();
        },
        revert: "invalid",
        revertDuration: 500
    });
    
    $(".addable1").draggable({
        helper: function () {
            return $(this).clone().find("p").css("display", "");
        },
        revert: "invalid",
        revertDuration: 500
    });

    $(".semester").each(function(){
        $(this).css("transform" , 'rotate(' + (Math.random() * 5 - 2.5) + 'deg)');
    });
    
    calcCredits();
    checkReqs();
}

//mark courses as met or not met
function checkReqs() {
    let $rs = $(".left .upper").find('p');
    let $cs = $(".year").find('p');
    
    for (let i = 0; i < $rs.length; i++) {
        
        $($rs[i]).find("img").attr("src", "/img/cross.png");
        $($rs[i]).removeClass("planned");
        
        for (let j = 0; j < $cs.length; j++) {
            if ($($rs[i]).text() == $($cs[j]).text()) {
                $($rs[i]).find("img").attr("src", "/img/check.png");
                $($rs[i]).attr("class", "planned addable");
            }
        }
    }
}


loadPlan();
async function loadPlan() {

    // Error handling CHANGE THIS TO PROMISE CHECK
    // if (this.status != 200) {
        // 	console.log("Course data unavailable");
        // 	return;
        // }
        
    let data = logJSON();
    let student;
    let courses;
    let catalog;
    await data.then(function (result) {
        // Variables to store text
        student = result.plan;
        courses = result.plan.courses;
        catalog = result.catalog.courses;
    });
    
    // Load basic student info
    studentField = document.getElementById("studentName");
    majorField = document.getElementById("studentMajor");
    catalogField = document.getElementById("studentCatalog");
    minorField = document.getElementById("studentMinor");
    
    let toInsert = student.student;
    toInsert = toInsert.substring(0, toInsert.indexOf('@'));
    studentField.innerHTML += toInsert;
    catalogField.innerHTML += student.catYear;
    minorField.innerHTML += "Bible";
    
    let majorText = "";
    student.majors.forEach(function (major) {
        majorText += major + " ";
    });
    majorField.innerHTML += majorText;

    
    // Set up initial semester blocks (Make 4 initially)
    let knownYears = [];
    let startYear = Number.MAX_SAFE_INTEGER;
    let endYear = 0;
    for (const course in courses) {
        const obj = courses[course];
        if (obj.year <= startYear) {
            startYear = Number(obj.year)
            if (obj.term != "Fall") {
                startYear -= 1;
            }
        }
        if (obj.year >= endYear) {
            endYear = Number(obj.year);
            if (obj.term == "Fall") {
                endYear += 1;
            }
        }
        if (!knownYears.includes(obj.year) && obj.term == "Fall") {
            knownYears.push(obj.year);
        }
    };
    
    // Load nodes into Academic Plan
    let numNodes = 0;
    let years = endYear - startYear;
    let currYear = startYear;
    
    // If there are no courses in the plan...
    if (years < 0) {
        years = 4;
        let date = new Date().getFullYear();
        currYear = date;
    }
    let terms = ["Fall", "Spring", "Summer"];
    
    
    let plan = document.querySelector("#planCont"); //container in plan to stick years in

    let i = 0;
    for (i; i < years; i++) { //note
        let newYear = document.createElement("div");
        newYear.classList.add("year");

        for(let j = 0; j < 3; j++){
            // Adjust year
            if (terms[j] == "Spring") {
                currYear += 1;
            }
            
            // Insert node
            let newTerm = document.createElement("div");
            newTerm.setAttribute("class", "semester");
            newTerm.id = terms[j] + currYear.toString();
            newTerm.innerHTML = "<h2>" + terms[j] + " " + currYear.toString() + "</h2>";
            numNodes += 1;
            
            // Insert credits
            let credits = document.createElement("p");
            credits.setAttribute("class", "credits");
            credits.innerText = "Credits: 0";
            newTerm.append(credits);
            newTerm.style.transform = 'rotate(' + (Math.random() * 5 - 2.5) + 'deg)';

            //add to year
            newYear.appendChild(newTerm);
        }

        plan.appendChild(newYear);
    }

    // Clean up (guarantee 4 years)
    for (i = years; i < 4; i++) {
        let newYear = document.createElement("div");
        newYear.classList.add("year");
        for(let j = 0; j < 3; j++){
            // Adjust year
            if (terms[j] == "Spring") {
                currYear += 1;
            }
            
            // Insert empty node
            let newTerm = document.createElement("div");
            newTerm.setAttribute("class", "semester");
            newTerm.id = terms[j] + currYear.toString();
            newTerm.innerHTML = "<h2>" + terms[j] + " " + currYear.toString() + "</h2>";
            let credits = document.createElement("p");
            credits.setAttribute("class", "credits");
            credits.innerText = "Credits: 0";
            newTerm.append(credits);
            newTerm.style.backgroundColor = "rgb(" + (Math.random() * 55 + 200) + ", " + (Math.random() * 55 + 200) + ", " + (Math.random() * 55 + 200) + ")";
            newTerm.style.transform = 'rotate(' + (Math.random() * 5 - 2.5) + 'deg)';
            newYear.appendChild(newTerm);
        }
        plan.appendChild(newYear);
    }

    // Gray out historical semesters
    grayHistory(Number(student.currYear), student.currTerm);
    
    // Load courses into semesters
    for (const course in courses) {
        const obj = courses[course];
        
        // Get info from catalog and include course name from it
        let name = obj.courseId;
        let term = obj.term;
        let year = obj.year.toString();
        let credits = Number(catalog[name].credits);
        name = catalog[name].name;
        let semesterId = `#${term}${year}`;
        
        // Add course to semester
        let node = $(semesterId);
        node.append("<p class='draggable course'>" + obj.courseId + " " + name + "<span style='display: none;'>" + credits + "</span></p>");
    }
    
    //calculate semester credits and total credits
    calcCredits();
    refreshFunctionality();
};

function calcCredits() {
    let totCred = 0;
    $(".semester").each(function () {
        let credits = 0;
        let sId = this.id;
        $("#" + sId + " .course span").each(function () {
            credits += Number(this.innerText);
            totCred += Number(this.innerText);
        });
        $("#" + sId + " .credits").text("Credits: " + credits);
    });
    $("#studentCredits").text("Total Credits: " + totCred);
}

function grayHistory(currYear, currTerm) {
    // Variables to store text
    semesters = $(".semester h2");
    term = ["Fall", "Spring", "Summer"];
    
    // Compare and gray
    for (semester in semesters) {
        let year = 0;
        let text = semesters[semester].innerText;
        if (text !== undefined) {
            year = text.split(" ");
        }

        if ((year[1] < currYear) || ((year[1] == currYear) && ((term.indexOf(year[0]) < term.indexOf(currTerm))))) {
            let cssSem = semesters[semester].parentNode;
            cssSem.style.backgroundColor = "rgba(" 
            + (Math.random() * 50) + ", " + (Math.random() * 50) + ", " + (Math.random() * 50) + ", 0.8)";
            cssSem.classList.add("dark");
            
        } else {
            //semesters[semester].parentNode.style.backgroundColor = "#00000099";
            let cssSem = semesters[semester].parentNode;
            cssSem.style.backgroundColor = "rgba(" 
            + (Math.random() * 50) + ", " + (Math.random() * 50) + ", " + (Math.random() * 50) + ", 0.8)";
            cssSem.classList.add("dark");
            break;
        }
    }
}

//TODO: change status check to a promise check!
//TODO data (calling logJSON) should be a global variable maybe
courseFindInit();
async function courseFindInit() {
    // Error handling
    // if (this.status != 200) {
        //     console.log("Course Finder Could Not FullFill Purpose: Terminating All Life");
        //     return;
        // }
        
        let data = logJSON();
        let courseList;
        await data.then(function (response) {
            courseList = response.catalog.courses;
        });
        
        for (const course in courseList) {
            let temp = courseList[course];
            let id = temp.id;
            let cName = courseList[id].name;
            let cred = courseList[id].credits;
            let desc = courseList[id].description;
            $("#courseId").append("<div class='addable1'>" + id
            + "<p style='display: none;' class='draggable course'>"
            + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");
            
            $("#courseName").append("<div class='addable1'>" + cName
            + "<p style='display: none;' class='draggable course'>"
            + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");
            
            $("#courseCredits").append("<div class='addable1'>" + cred
            + "<p style='display: none;' class='draggable course'>"
            + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");
            
            $("#courseDescript").append("<div class='addable1'>" + desc
            + "<p style='display: none;' class='draggable course'>"
            + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");
        }
        refreshFunctionality();
    }


function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


//clicking add year adds a new row of semesters at the end of the plan
$("#addYear").click(function(){
    //find the year of the last semester listed
    let $latestYear = parseInt($("#planCont .year").last().find(".semester").last().find("h2").text().split(" ")[1]);
    let nextYear = $latestYear + 1;

    //new semester ids
    let fid = "Fall" + $latestYear;
    let sid = "Spring" + nextYear;
    let suid = "Summer" + nextYear;
    
    //deep copy last year
    let $clone = $("#planCont .year").last().clone();
    let $semesters = $clone.find(".semester");
    
    //reset content and ids
    $clone.find(".semester:eq(0)").attr('id', fid);
    $clone.find(".semester:eq(1)").attr('id', sid);
    $clone.find(".semester:eq(2)").attr('id', suid);
    $semesters.html("");
    $semesters.append("<h2></h2>");
    $semesters.append('<p class="credits">Credits: 0</p>');
    $clone.find(".semester:eq(0) h2").text("Fall " + $latestYear);
    $clone.find(".semester:eq(1) h2").text("Spring " + nextYear);
    $clone.find(".semester:eq(2) h2").text("Summer " + nextYear);

    //rotate and color new semesters
    $semesters.each(function(){
        $(this).css("backgroundColor", "rgb(" + (Math.random() * 55 + 200) + ", " + (Math.random() * 55 + 200) + ", " + (Math.random() * 55 + 200) + ")");
        $(this).css("transform" , 'rotate(' + (Math.random() * 5 - 2.5) + 'deg)');
    });
    
    //add to plan
    $("#planCont").append($clone);
    refreshFunctionality();
});

//delete removes last year and modifies the change log accordingly
$("#delYear").click(function(){
    let $years = $("#planCont .year");
    if($years.length > 4){ //always show at least four years
        $years = $years.last();
        // update log
        let $deletedCourses = $years.find(".semester").find("p").not(".credits");
        $deletedCourses.each(function(){
            $("#changeLog").append("DEL " + $(this).parent().id + " " + $(this).text() + "\n"); //add remove entry to change log from deleted year
            console.log($("#changeLog"));
        });
        $years.remove();
    }
    else{
        alert("Page shows a minimum of four years.");
    }
});

//save button applies changeLog to database.
$("#save").click(function(){
    //send changeLog to server-side script to save to db
    //send notes content to server-side
    $("#saveForm").submit();
});
