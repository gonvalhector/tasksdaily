function submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = $("#submit");
    // Iterate over all the input checks
    let inputsCheck = false;
    for (let i = 0; i < inputsChecks.length; i++) {
        if (inputsChecks[i] === true) {
            inputsCheck = true;
            break;
        }
    }
    // Iterate over all the select checks
    let categorySelectsCheck = false;
    for (let i = 0; i < categorySelectsChecks.length; i++) {
        if (categorySelectsChecks[i] === true) {
            categorySelectsCheck = true;
            break;
        }
    }
    // Iterate over all the is active checkboxes checks
    let isActiveCheck = false;
    for (let i = 0; i < isActiveChecks.length; i++) {
        if (isActiveChecks[i] === true) {
            isActiveCheck = true;
            break;
        }
    }
    // Iterate over all the weekdays checkboxes checks
    const weekdays = 7;
    let weekdaysCheck = false;
    for (let i = 0; i < weekdaysChecks.length; i++) {
        // Check for valid changes
        for (let j = 0; j < weekdays; j++) {
            if (weekdaysChecks[i][j] === true) {
                    weekdaysCheck = true;
                    break;
                }
        }
    }
    // If the weekday checkboxes check was clear
    if (weekdaysCheck === true) {
        for (let i = 0; i < weekdaysChecks.length; i++) {
            let unchecked = 0;
            // Check for valid changes
            for (let j = 0; j < weekdays; j++) {
                if (weekdaysBoxes[i][j].prop("checked") === false) {
                        unchecked++;
                    }
            }
            // If all the checkboxes are unchecked
            if (unchecked >= weekdays) {
                inputsCheck = false;
                categorySelectsCheck = false;
                weekdaysCheck = false;
                isActiveCheck = false;
                break;
            }
        }
    }
    submit.prop("disabled") = (inputsCheck || categorySelectsCheck || weekdaysCheck || isActiveCheck === true) ? false : true;
}

$(function() {
    // Declare variables related to the task name and category name inputs
    let inputs = $(".form-control");
    let inputsChecks = [];
    let inputsOrigValues = [];
    // Add original values from inputs to list
    inputs.each(function(index, element) {
        inputsOrigValues.push($(this).val());
        inputsChecks.push(false);
    });
    // Declare variables related to the task category selects
    let categorySelects = $(".custom-select");
    let categorySelectsLength = categorySelects.length;
    let categorySelectsChecks = [];
    let selectsOrigValues = [];
    // Add original values from selects to list
    categorySelects.each(function(index, element) {
        selectsOrigValues.push($(this).val());
        categorySelectsChecks.push(false);
    });
    // Declare variables related to the weekday and active checkboxes
    let checkboxes = $(".form-check-input");
    let allWeekdayBoxes = [];
    let allWeekdaysOrigValues = [];
    let allWeekdaysChecks = [];
    let isActiveBoxes = [];
    let isActiveOrigValues = [];
    let isActiveChecks = [];
    // Sort cheboxes by weekday and by is_active
    // Add original checked boolean from checkboxes to corresponding lists
    checkboxes.each(function(index, element) {
        let checkbox = $(this);
        if (checkbox.attr("data-type") == "weekday") {
            allWeekdayBoxes.push(checkbox);
            allWeekdaysOrigValues.push(checkbox.prop("checked"));
            allWeekdaysChecks.push(false);
        }
        else {
            isActiveBoxes.push(checkbox);
            isActiveOrigValues.push(checkbox.prop("checked"));
            isActiveChecks.push(false);
        }
    });
    // Sort through weekdays by row by slicing the orig array
    // Define arrays to add the sorted weekdays into
    let weekdaysBoxes = [];
    let weekdaysOrigValues = [];
    let weekdaysChecks = [];
    // Define start and end of a weekday
    const start = 0;
    const end = 7;
    // Define number of days on a week
    const n = end;
    for (let i = 0; i < categorySelectsLength; i++) {
        let factor = n * i;
        let boxRow = allWeekdayBoxes.slice(start + factor, end + factor);
        weekdaysBoxes.push(boxRow);
        let valueRow = allWeekdaysOrigValues.slice(start + factor, end + factor);
        weekdaysOrigValues.push(valueRow);
        let checkRow = allWeekdaysChecks.slice(start + factor, end + factor);
        weekdaysChecks.push(checkRow);
    }
    // Disable submit button
    submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
    // Iterate over each input
    inputs.each(function(index, element) {
        let input = $(this);
        let origValue = inputsOrigValues[index];
        input.on("input", function() {
            let count = 0;
            if (input.val() != "") {
                count++;
            }
            if (input.val().length < 64) {
                count++;
            }
            if (input.val() !== origValue) {
                count++;
            }
            let isValid = (count === 3) ? true : false;
            inputsChecks[index] = isValid;
            submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
        });
    });
    // Iterate over each select
    categorySelects.each(function(index, element) {
        let select = $(this);
        let origValue = selectsOrigValues[index];
        select.on("change", function() {
            let count = 0;
            if (select.val() != "") {
                count++;
            }
            if (select.val() !== origValue) {
                count++;
            }
            let isValid = (count === 2) ? true : false;
            categorySelectsChecks[index] = isValid;
            submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
        });
    });
    // Iterate over each checkbox
    for (let i = 0; i < categorySelectsLength; i++) {
        // Iterate over weekdays checkboxes
        for (let j = 0; j < n; j++) {
            let weekdaysBox = weekdaysBoxes[i][j];
            let weekdaysOrigValue = weekdaysOrigValues[i][j];
            weekdaysBox.on("change", function() {
                let isValid = (weekdaysBox.prop("checked") != weekdaysOrigValue) ? true : false;
                weekdaysChecks[i][j] = isValid;
                submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
            });
        }
        // Iterate over is active checkboxes
        let isActiveBox = isActiveBoxes[i];
        let isActiveOrigValue = isActiveOrigValues[i];
        isActiveBox.on("change", function() {
            let isValid = (isActiveBox.prop("checked") != isActiveOrigValue) ? true : false;
            isActiveChecks[i] = isValid;
            submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
        });
    }

});
