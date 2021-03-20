function userHelp($element) {
    /*
    Select the small element with tips
    next to the input element that triggered
    the event and make it visible or hidden.
    */
    let tip;
    if ($element.next().attr("id") === undefined) {
        let whitespace = $element.next();
        tip = whitespace.next();
    }
    else {
        tip = $element.next();
    }
    let className = $element.attr("class");
    let subStr = " invalid";
    if (className.includes(subStr) === true) {
        tip.show();
    }
    else {
        tip.toggle();
    }
}

function submitState(categoryCheck, taskNameCheck, weekdaysCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = (categoryCheck && taskNameCheck && weekdaysCheck === true) ? false : true;
    $("#submit").prop("disabled", submit);
}

function styleAsInvalid($element, check) {
    /*
    Add the invalid class to elements that have an
    input check of false.
    */
    let className = $element.attr("class");
    let subStr = " invalid";
    let tip;
    if ($element.next().attr("id") === undefined) {
        let whitespace = $element.next();
        tip = whitespace.next();
    }
    else {
        tip = $element.next();
    }
    // Add the invalid class if the element does not have it yet
    if (check === false) {
        if (className.includes(subStr) === false) {
            className = className + " invalid";
            $element.attr("class", className)
            tip.show();
        }
    }
    // Remove the invalid class if the element does not need it anymore
    else {
        if (className.includes(subStr) === true) {
            className = className.replace(subStr, "");
            $element.attr("class", className)
            tip.hide();
        }
    }
}

$(function() {
    let $categorySelect;
    let categoryCheck;
    if ($("#categorySelect")) {
        $categorySelect = $("#categorySelect");
    }
    else {
        $categorySelect = null;
    }
    categoryCheck = false;
    let $categoryNameInput = $("#categoryName");
    let $categoryNameHelp = $("#categoryNameHelp");
    // Hide small text help for user input
    $categoryNameHelp.hide();
    let $taskNameInput = $("#taskName");
    let taskNameCheck = false;
    let $taskNameHelp = $("#taskNameHelp");
    // Hide small text help for user input
    $taskNameHelp.hide();
    let $weekdaysCheckboxes = $(".form-check-input");
    let weekdaysLength = $weekdaysCheckboxes.length;
    let weekdaysCheck = false;
    // Disable submit button
    submitState(categoryCheck, taskNameCheck, weekdaysCheck);
    // Events for category select
    if ($categorySelect) {
        $categorySelect.on("change", function() {
            let isValid = ($categorySelect.val() != "") ? true : false;
            categoryCheck = isValid;
            submitState(categoryCheck, taskNameCheck, weekdaysCheck);
        });
    }
    // Events for task name input
    $categoryNameInput.on("focus", function() {
        userHelp($categoryNameInput);
    });
    $categoryNameInput.on("blur", function() {
        userHelp($categoryNameInput);
        styleAsInvalid($categoryNameInput, categoryCheck);
    });
    $categoryNameInput.on("input", function() {
        let count = 0;
        if ($categoryNameInput.val() != "") {
            count++;
        }
        if ($categoryNameInput.val().length < 64) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        if ($categorySelect) {
            if ($categorySelect.val() != "") {
                isValid = true;
            }
        }
        categoryCheck = isValid;
        submitState(categoryCheck, taskNameCheck, weekdaysCheck);
    });
    // Events for task name input
    $taskNameInput.on("focus", function() {
        userHelp($taskNameInput);
    });
    $taskNameInput.on("blur", function() {
        userHelp($taskNameInput);
        styleAsInvalid($taskNameInput, taskNameCheck);
    });
    $taskNameInput.on("input", function() {
        let count = 0;
        if ($taskNameInput.val() != "") {
            count++;
        }
        if ($taskNameInput.val().length < 64) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        taskNameCheck = isValid;
        submitState(categoryCheck, taskNameCheck, weekdaysCheck);
    });
    // Event listeners for weekdaysCheckboxes
    let checksCount = 0;
    $weekdaysCheckboxes.each(function(index, element) {
        let $weekdaysCheckbox = $(this);
        $weekdaysCheckbox.on("change", function() {
            if ($weekdaysCheckbox.prop("checked") === true) {
                checksCount++;
            }
            else {
                checksCount--;
            }
            let isValid = (checksCount > 0) ? true : false;
            weekdaysCheck = isValid;
            submitState(categoryCheck, taskNameCheck, weekdaysCheck);
        });
    });
});
