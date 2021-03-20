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
    // Define the changed select
    let select;
    selects.each(function(index, element) {
        if ($(this).attr("id") === element.attr("data-task")) {
            select = $(this);
        }
    });
    // Select the current img and its title
    let img = element.children().first();
    let title = img.attr("title");
    switch(title) {
        // Change to the next status according to current status
        case "Pending":
            img.attr({
                src: "/static/tasks/images/icons/complete.svg",
                title: "Complete",
                class: "complete"
            });
            // Change selected option
            select.selectedIndex = 1;
            break;
        case "Complete":
            img.attr({
                src: "/static/tasks/images/icons/incomplete.svg",
                title: "Incomplete"),
                class: "incomplete")
            });
            // Change selected option
            select.selectedIndex = 2;
            break;
        case "Incomplete":
            img.attr({
                src: "/static/tasks/images/icons/ignored.svg",
                title: "Ignored"),
                class: "ignored")
            });
            // Change selected option
            select.selectedIndex = 3;
            break;
        default:
            img.attr({
                src: "/static/tasks/images/icons/pending.svg",
                title: "Pending"),
                class: "pending")
            });
            // Change selected option
            select.selectedIndex = 0;
        // Manually trigger the change event
        if (select.dispatchEvent) {
            select.dispatchEvent(new Event("change"));
        }
        else {
            select.fireEvent(new Event("change"));
        }
    }
}

$(function() {
    // Change the style of the status thead
    let theads = $(".text-left");
    theads.removeClass("text-left");
    theads.addClass("text-center");
    // Define all status selects
    let statusSelects = $(".custom-select");
    let selectsOrigValues = [];
    let selectsChanges = [];
    // Iterate over each select
    statusSelects.each(function(index, element) {
        let select = $(this);
        // Hide select
        select.hide();
        selectsOrigValues.push(select.val());
        selectsChanges.push(false);
    });
    let selectsCheck = false
    // Select note element
    let note = $("#note");
    let noteOrigValue = note.val();
    let noteCheck = false;
    // Disable submit button
    submitState(selectsCheck, noteCheck);
    // Select all status buttons
    let statusButtons = $(".status");
    // Iterate over each status button
    statusButtons.each(function(index, element) {
        let button = $(this);
        // Change status on click
        button.on("click", changeStatus(button, statusSelects));
    });
    // Iterate over each status select again
    statusSelects.each(function(index, element) {
        let select = $(this);
        select.on("change", function() {
            selectsChanges[index] = (select.val() !== selectsOrigValues[index]) ? true : false;
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
    });
    // When input us detected in the note element
    note.on("input", function() {
        noteCheck = (note.val() !== noteOrigValue) ? true : false;
        submitState(selectsCheck, noteCheck);
    });
});
