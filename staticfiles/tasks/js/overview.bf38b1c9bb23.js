function submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = document.getElementById("submit");
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
                if (weekdaysBoxes[i][j].checked === false) {
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
    submit.disabled = (inputsCheck || categorySelectsCheck || weekdaysCheck || isActiveCheck === true) ? false : true;
}

document.addEventListener("DOMContentLoaded", () => {
    // Declare variables related to the task name and category name inputs
    let inputs = document.getElementsByClassName("form-control");
    let inputsLength = inputs.length;
    let inputsChecks = [];
    // Add original values from inputs to list
    let inputsOrigValues = [];
    for (let i = 0; i < inputsLength; i++) {
        inputsOrigValues.push(inputs.item(i).value);
        inputsChecks.push(false);
    }
    // Declare variables related to the task category selects
    let categorySelects = document.getElementsByClassName("custom-select");
    let categorySelectsLength = categorySelects.length;
    let categorySelectsChecks = [];
    // Add original values from selects to list
    let selectsOrigValues = [];
    for (let i = 0; i < categorySelectsLength; i++) {
        selectsOrigValues.push(categorySelects.item(i).value);
        categorySelectsChecks.push(false);
    }
    // Declare variables related to the weekday and active checkboxes
    let checkboxes = document.getElementsByClassName("form-check-input");
    let checkboxesLength = checkboxes.length;
    let allWeekdayBoxes = [];
    let allWeekdaysOrigValues = [];
    let allWeekdaysChecks = [];
    let isActiveBoxes = [];
    let isActiveOrigValues = [];
    let isActiveChecks = [];
    // Sort cheboxes by weekday and by is_active
    // Add original checked boolean from checkboxes to corresponding lists
    for (let i = 0; i < checkboxesLength; i++) {
        let checkbox = checkboxes.item(i);
        if (checkbox.dataset.type == "weekday") {
            allWeekdayBoxes.push(checkbox);
            allWeekdaysOrigValues.push(checkbox.checked);
            allWeekdaysChecks.push(false);
        }
        else {
            isActiveBoxes.push(checkbox);
            isActiveOrigValues.push(checkbox.checked);
            isActiveChecks.push(false);
        }
    }
    // Sort through weekdays by row by slicing the orig array
    // Define arrays to add the sorted weekdays into
    let weekdaysBoxes = [];
    let weekdaysOrigValues = [];
    let weekdaysChecks = [];
    // Define start and end of a weekday
    const start = 0;
    const end = 7;
    // Define number of days on a week
    const n = 7;
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
    // Event listeners for inputs
    for (let i = 0; i < inputsLength; i++) {
        let input = inputs.item(i);
        let origValue = inputsOrigValues[i];
        input.addEventListener("input", () => {
            let count = 0;
            if (input.value != "") {
                count++;
            }
            if (input.value.length < 64) {
                count++;
            }
            if (input.value !== origValue) {
                count++;
            }
            let isValid = (count === 3) ? true : false;
            inputsChecks[i] = isValid;
            submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
        });
    }
    // Event listeners for selects
    for (let i = 0; i < categorySelectsLength; i++) {
        let select = categorySelects.item(i);
        let origValue = selectsOrigValues[i];
        select.addEventListener("change", () => {
            let count = 0;
            if (select.value != "") {
                count++;
            }
            if (select.value !== origValue) {
                count++;
            }
            let isValid = (count === 2) ? true : false;
            categorySelectsChecks[i] = isValid;
            submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
        });
    }
    // Event listeners for checkboxes
    for (let i = 0; i < categorySelectsLength; i++) {
        // Event listeners for weekdays checkboxes
        for (let j = 0; j < n; j++) {
            let weekdaysBox = weekdaysBoxes[i][j];
            let weekdaysOrigValue = weekdaysOrigValues[i][j];
            weekdaysBox.addEventListener("change", () => {
                let isValid = (weekdaysBox.checked != weekdaysOrigValue) ? true : false;
                weekdaysChecks[i][j] = isValid;
                submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
            });
        }
        // Event listeners for is active checkboxes
        let isActiveBox = isActiveBoxes[i];
        let isActiveOrigValue = isActiveOrigValues[i];
        isActiveBox.addEventListener("change", () => {
            let isValid = (isActiveBox.checked != isActiveOrigValue) ? true : false;
            isActiveChecks[i] = isValid;
            submitState(inputsChecks, categorySelectsChecks, weekdaysBoxes, weekdaysChecks, isActiveChecks);
        });
    }
});
