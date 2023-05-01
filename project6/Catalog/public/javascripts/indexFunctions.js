// Initialization
$(document).ready(function () {

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
            return JSON.parse(data);
        });
    return data;
}

//begin code copied from project 5:

// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
window.onload = function () {
    refreshFunctionality();
}
/*
//load website if user accesses faculty page
if (window.location.pathname === "/AccountAuth/Faculty") {

    let userPlan = new XMLHttpRequest();
    userPlan.addEventListener("load", addToFaculty);
    userPlan.responseType = "json";
    userPlan.open("GET", "/AccountAuth/GetAccount");
    userPlan.send();

    // Click event for these links
    $(document).on('click', '.facultyItem', function () {
        let p = $(this).text();
        let a = $(this).attr('id');
        let key = 'displayUser';
        let value = p + '|-|' + a;
        sessionStorage.setItem(key, value);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/GetCombined/SetSessionVariable?key=' + encodeURIComponent(key) + '&value=' + encodeURIComponent(value), true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log("Session variable set on server side");
            } else {
                console.log('Error setting session variable on server side');
            }
        };
        xhr.onerror = function () {
            console.log('Error occurred while setting session variable on server side');
        };
        xhr.send();
    });


}


function addToFaculty() {
    if (this.status !== 200) {
        console.log("Stuffs from AccountAuth didnt load");
        return;
    }
    console.log(this.response);
    console.log("loaded fac");

    let planInfo = this.response.accounts;
    let toInsert = $("#facultyView-nnoonn");
    for (let key in planInfo) {
        let bullet = $('<li>');
        let p = $('<p>').text(key);
        bullet.append(p);

        let ul = $('<ul>');
        planInfo[key].data.forEach(function (element) {
            if (element.planName != "initPName") {
                let li = $('<li>');
                let a = $('<a>')
                    .addClass('facultyItem')
                    .attr('id', key)
                    .attr('href', '/')
                    .text(element.planName);
                li.append(a);
                ul.append(li);
            }

            });
            bullet.append(ul);
            toInsert.append(bullet);
    	

    }


}
*/



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
    
    //
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
    
    calcCredits();
    checkReqs();
}

function checkReqs() {
    let $rs = $(".left .upper").find('p');
    let $cs = $(".year").find('p');
    
    for (let i = 0; i < $rs.length; i++) {
        
        $($rs[i]).find("img").attr("src", "/img/cross.png");
        $($rs[i]).removeClass("planned");
        
        for (let j = 0; j < $cs.length; j++) {
            //console.log($($rs[i]).text());
            //console.log($($cs[j]).text());
            if ($($rs[i]).text() == $($cs[j]).text()) {
                $($rs[i]).find("img").attr("src", "/img/check.png");
                $($rs[i]).attr("class", "planned addable");
            }
        }
    }
}




/* *****    This is done in logJSON function above      ********
// Load website data if we're on the Index page ("/")
if (window.location.pathname === "/") {
    
    // let planData = new XMLHttpRequest();
    // planData.addEventListener("load", loadPlan);
    // planData.addEventListener("load", courseFindInit);
    // planData.responseType = "json";
    // planData.open("GET", "/GetComBINed");
    // planData.send();
    let catalogData = new XMLHttpRequest();
    catalogData.addEventListener("load", loadAccordion);
    catalogData.responseType = "json";
    catalogData.open("GET", "/GetRequirements/retrieve/");
    catalogData.send();
}
*/

loadPlan();
async function loadPlan() {
    // Error handling
    // if (this.status != 200) {
        // 	console.log("Course data unavailable");
        // 	return;
        // }
        
        // DELETE: Print session variables
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const value = sessionStorage.getItem(key);
        
        }
        
    let data = logJSON();
    let plan;
    let student;
    let courses;
    let catalog;
    await data.then(function (result) {
        // Variables to store text
        student = result.plan;
        courses = result.plan.courses;
        catalog = result.catalog.courses;
    });
    plan = document.querySelector(".year");
    
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
    
    
    let i = 0;
    for (i; i < years * 3; i++) {
        // Adjust year
        if (terms[i % 3] == "Spring") {
            currYear += 1;
        }
        
        // Insert node
        let newTerm = document.createElement("div");
        newTerm.setAttribute("class", "semester");
        newTerm.id = terms[i % 3] + currYear.toString();
        newTerm.innerHTML = "<h2>" + terms[i % 3] + " " + currYear.toString() + "</h2>";
        numNodes += 1;
        
        // Insert credits
        let credits = document.createElement("p");
        credits.setAttribute("class", "credits");
        credits.innerText = "Credits: 0";
        credits.style = "margin: 0";
        newTerm.append(credits);
        newTerm.style.transform = "rotate(" + (Math.random() * 5 - 2.5) + "deg)";
        
        plan.appendChild(newTerm);
    }

    // Clean up (guarantee 4 years)
    if (numNodes < 12) {
        for (i; i < 12; i++) {
            // Adjust year
            if (terms[i % 3] == "Spring") {
                currYear += 1;
            }
            
            // Insert empty node
            let newTerm = document.createElement("div");
            newTerm.setAttribute("class", "semester");
            newTerm.id = terms[i % 3] + currYear.toString();
            newTerm.innerHTML = "<h2>" + terms[i % 3] + " " + currYear.toString() + "</h2>";
            let credits = document.createElement("p");
            credits.setAttribute("class", "credits");
            credits.innerText = "Credits: 0";
            credits.style = "margin: 0";
            newTerm.append(credits);
            newTerm.style.transform = "rotate(" + (Math.random() * 5 - 2.5) + "deg)";
            newTerm.style.backgroundColor = "rgb(" + (Math.random() * 55 + 200) + ", " + (Math.random() * 55 + 200) + ", " + (Math.random() * 55 + 200) + ")";
            plan.appendChild(newTerm);
        }
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
    $("#TotalCredits").text("Credits: " + totCred);
}

/*
function loadAccordion() {
    // Error handling
    if (this.status != 200) {
        console.log("Accordion data unavailable");
        return;
    }
    
    // Variables to store text
    let requirements = $(".left div.section.upper");
    
    const catalog = this.response.catalog.courses;
    const categories = this.response.categories;
    // Create the accordion widget
    $(function () {
        requirements.accordion();
    });
    
    // Populate accordion
    for (const category in categories) {
        // Create header block
        const tab = categories[category];
        // Hi Dr. Knoerr :) Don't judge our capitalization code ... Spencer wrote it (it's efficient)
        requirements.append("<h3>" + category.charAt(0).toUpperCase() + category.substring(1) + "</h3>");
        courses = $("<div>");
        
        // Add classes to block
        tab.forEach(function (major) {
            major.forEach(function (course) {
                let p = $("<p>").addClass('planned addable');
                p.append("<img>" + course + " " + catalog[course].name
                + "<span style='display: none;'>" + catalog[course].credits + "</span>");
                courses.append(p);
            });
            requirements.append(courses);
        });
    }
    refreshFunctionality();
}
*/

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


    let cSearch = $("#cSearch");
    cSearch.on("input", onInput);
    
    function onInput() {
    let input = cSearch.val();
    $("#courseIdL").empty();
    $("#courseNameL").empty();
    $("#creditsL").empty();
    $("#DescriptL").empty();

    $("#courseIdL").append("<strong>Course ID</strong>");
    $("#courseNameL").append("<strong>Course Name</strong>");
    $("#creditsL").append("<strong>Credits</strong>");
    $("#DescriptL").append("<strong>Description</strong>");

    for (const corse in courseList) {
        let temp = courseList[corse];
        let id = temp.id;
        let cName = courseList[id].name;
        let cred = courseList[id].credits;
        let desc = courseList[id].description;


        if (id.includes(input.toUpperCase()) || cName.toUpperCase().includes(input.toUpperCase()) || desc.toUpperCase().includes(input.toUpperCase())) {
            $("#courseIdL").append("<div class='addable1'>" + id
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");

            $("#courseNameL").append("<div class='addable1'>" + cName
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");

            $("#creditsL").append("<div class='addable1'>" + cred
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");

            $("#DescriptL").append("<div class='addable1'>" + desc
                + "<p style='display: none;' class='draggable course'>"
                + id + " " + cName + "<span style='display: none;'>" + cred + "</span></p></div>");
        }
    }
    refreshFunctionality();
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
blink();
async function blink() {
    for(let i = 0; i < 5000; i++){
        $(".fireflies li").each(async function(){
            if (Math.random() > 0.5) {
                $(this).fadeTo(300, 0);
            }
            else {
                $(this).fadeTo(300, 1);
            }
            await delay((Math.random() * 3000));
        });
    }
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
