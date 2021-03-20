function submitState(selectsCheck, noteCheck) {
    /*
    Disable or enable the submit button according to the
    state of the form field checks.
    */
    let submit = (selectsCheck || noteCheck === true) ? false : true;
    $("#submit").prop("disabled", submit);
}

function changeStatus(element, selects) {
/*
Change the image icon and the selected option for the
status of a task when the status icon is clicked
*/
    let select;
    for (let i = 0; i < selects.length; i++) {
        if (selects.item(i).id === element.dataset.task) {
            select = selects.item(i);
            break;
        }
    }
    let img = element.firstElementChild;
    let src = img.getAttribute("src");
    switch(src) {
        case "/static/tasks/images/icons/pending.svg":
            img.setAttribute("src", "/static/tasks/images/icons/complete.svg");
            img.setAttribute("title", "Complete");
            img.setAttribute("class", "complete");
            // Change selected option
            select.selectedIndex = 1;
            // Manually trigger the change event
            select.dispatchEvent(new Event("change"));
            break;
        case "/static/tasks/images/icons/complete.svg":
            img.setAttribute("src", "/static/tasks/images/icons/incomplete.svg");
            img.setAttribute("title", "Incomplete");
            img.setAttribute("class", "incomplete");
            select.selectedIndex = 2;
            // Manually trigger the change event
            select.dispatchEvent(new Event("change"));
            break;
        case "/static/tasks/images/icons/incomplete.svg":
            img.setAttribute("src", "/static/tasks/images/icons/ignored.svg");
            img.setAttribute("title", "Ignored");
            img.setAttribute("class", "ignored");
            select.selectedIndex = 3;
            // Manually trigger the change event
            select.dispatchEvent(new Event("change"));
            break;
        default:
            img.setAttribute("src", "/static/tasks/images/icons/pending.svg");
            img.setAttribute("title", "Pending");
            img.setAttribute("class", "pending");
            select.selectedIndex = 0;
            // Manually trigger the change event
            select.dispatchEvent(new Event("change"));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let theads = document.getElementsByClassName("text-left");
    let theadsLength = theads.length;
    for (let k = 0; k < theadsLength; k++) {
        theads.item(0).className = "text-center";
    }
    let statusSelects = document.getElementsByClassName("custom-select");
    let selectsOrigValues = [];
    let selectsChanges = [];
    for (let i = 0; i < statusSelects.length; i++) {
        let select = statusSelects.item(i);
        select.hidden = true;
        selectsOrigValues.push(select.value);
        selectsChanges.push(false);
    }
    let selectsCheck = false
    let statusButtons = document.getElementsByClassName("status");
    let note = document.getElementById("note");
    let noteOrigValue = note.value;
    let noteCheck = false;
    submitState(selectsCheck, noteCheck);
    // Event listener for status buttons
    for (let i = 0; i < statusButtons.length; i++) {
        let button = statusButtons.item(i);
        button.addEventListener("click", () => {
            changeStatus(button, statusSelects);
        });
    }
    // Event listener for status selects
    for (let i = 0; i < statusSelects.length; i++) {
        let select = statusSelects.item(i);
        select.addEventListener("change", () => {
            selectsChanges[i] = (select.value !== selectsOrigValues[i]) ? true : false;
            let isValid = false;
            for (let j = 0; j < selectsChanges.length; j++) {
                if (selectsChanges[j] === true) {
                    isValid = true;
                    break;
                }
            }
            selectsCheck = isValid;
            submitState(selectsCheck, noteCheck);
        });
    }
    // Event listener for note
    note.addEventListener("input", () => {
        noteCheck = (note.value !== noteOrigValue) ? true : false;
        submitState(selectsCheck, noteCheck);
    });
});
