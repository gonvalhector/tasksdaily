function userHelp(element) {
    /*
    Select the small element with tips
    next to the input element that triggered
    the event and make it visible or hidden.
    */
    let tip;
    if (element.nextSibling.id === undefined) {
        let whitespace = element.nextSibling;
        tip = whitespace.nextSibling;
    }
    else {
        tip = element.nextSibling;
    }
    let className = element.className;
    let subStr = " invalid";
    if (className.includes(subStr) === true) {
        tip.hidden = false;
    }
    else {
        tip.hidden = (tip.hidden === true) ? false : true;
    }
}

function styleAsInvalid(element, check) {
    /*
    Add the invalid class to elements that have an
    input check of false.
    */
    let className = element.className;
    let subStr = " invalid";
    let tip;
    if (element.nextSibling.id === undefined) {
        let whitespace = element.nextSibling;
        tip = whitespace.nextSibling;
    }
    else {
        tip = element.nextSibling;
    }
    // Add the invalid class if the element does not have it yet
    if (check === false) {
        if (className.includes(subStr) === false) {
            element.className = className + " invalid";
            tip.hidden = false;
        }
    }
    // Remove the invalid class if the element does not need it anymore
    else {
        if (className.includes(subStr) === true) {
            element.className = className.replace(subStr, "");
            tip.hidden = true;
        }
    }
}

function submitState(categoryCheck, taskNameCheck, weekdaysCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = document.getElementById("submit");
    submit.disabled = (categoryCheck && taskNameCheck && weekdaysCheck === true) ? false : true;
}

document.addEventListener("DOMContentLoaded", () => {
    let categorySelect;
    let categoryCheck;
    if (document.getElementById("categorySelect")) {
        categorySelect = document.getElementById("categorySelect");
    }
    else {
        categorySelect = null;
    }
    categoryCheck = false;
    let categoryNameInput = document.getElementById("categoryName");
    let categoryNameHelp = document.getElementById("categoryNameHelp");
    // Hide small text help for user input
    categoryNameHelp.hidden = true;
    let taskNameInput = document.getElementById("taskName");
    let taskNameCheck = false;
    let taskNameHelp = document.getElementById("taskNameHelp");
    // Hide small text help for user input
    taskNameHelp.hidden = true;
    let weekdaysCheckboxes = document.getElementsByClassName("form-check-input");
    let weekdaysLength = weekdaysCheckboxes.length;
    let weekdaysCheck = false;
    // Disable submit button
    submitState(categoryCheck, taskNameCheck, weekdaysCheck);
    // Event listeners for category select
    if (categorySelect) {
        categorySelect.addEventListener("change", () => {
            let isValid = (categorySelect.value != "") ? true : false;
            categoryCheck = isValid;
            submitState(categoryCheck, taskNameCheck, weekdaysCheck);
        });
    }
    // Event listeners for task name input
    categoryNameInput.addEventListener("focus", () => {
        userHelp(categoryNameInput);
    });
    categoryNameInput.addEventListener("blur", () => {
        userHelp(categoryNameInput);
        styleAsInvalid(categoryNameInput, categoryCheck);
    });
    categoryNameInput.addEventListener("input", () => {
        let count = 0;
        if (categoryNameInput.value != "") {
            count++;
        }
        if (categoryNameInput.value.length < 64) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        if (categorySelect) {
            if (categorySelect.value != "") {
                isValid = true;
            }
        }
        categoryCheck = isValid;
        submitState(categoryCheck, taskNameCheck, weekdaysCheck);
    });
    // Event listeners for task name input
    taskNameInput.addEventListener("focus", () => {
        userHelp(taskNameInput);
    });
    taskNameInput.addEventListener("blur", () => {
        userHelp(taskNameInput);
        styleAsInvalid(taskNameInput, taskNameCheck);
    });
    taskNameInput.addEventListener("input", () => {
        let count = 0;
        if (taskNameInput.value != "") {
            count++;
        }
        if (taskNameInput.value.length < 64) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        taskNameCheck = isValid;
        submitState(categoryCheck, taskNameCheck, weekdaysCheck);
    });
    // Event listeners for weekdaysCheckboxes
    let checksCount = 0;
    for (let i = 0; i < weekdaysLength; i++) {
        weekdaysCheckboxes.item(i).addEventListener("change", () => {
            if (weekdaysCheckboxes.item(i).checked === true) {
                checksCount++;
            }
            else {
                checksCount--;
            }
            let isValid = (checksCount > 0) ? true : false;
            weekdaysCheck = isValid;
            submitState(categoryCheck, taskNameCheck, weekdaysCheck);
        });
    }
});
