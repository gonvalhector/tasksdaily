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

function submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = document.getElementById("submit");
    submit.disabled = (usernameCheck || firstNameCheck || lastNameCheck || emailCheck === true) ? false : true;
}

document.addEventListener("DOMContentLoaded", () => {
    let usernameInput = document.getElementById("username");
    let username = usernameInput.value;
    let usernameHelp = document.getElementById("usernameHelp");
    // Hide small text help for user input
    usernameHelp.hidden = true;
    let usernameCheck = false;
    let firstNameInput = document.getElementById("first_name");
    let firstName = firstNameInput.value;
    let firstNameHelp = document.getElementById("firstNameHelp");
    // Hide small text help for first name input
    firstNameHelp.hidden = true;
    let firstNameCheck = false;
    let lastNameInput = document.getElementById("last_name");
    let lastName = lastNameInput.value;
    let lastNameHelp = document.getElementById("lastNameHelp");
    // Hide small text help for last name input
    lastNameHelp.hidden = true;
    let lastNameCheck = false;
    let emailInput = document.getElementById("email");
    let email = emailInput.value;
    let emailHelp = document.getElementById("emailHelp");
    // Hide small text help for email input
    emailHelp.hidden = true;
    let emailCheck = false;
    submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    // Event listeners for username input
    usernameInput.addEventListener("focus", () => {
        userHelp(usernameInput);
    });
    usernameInput.addEventListener("blur", () => {
        userHelp(usernameInput);
        styleAsInvalid(usernameInput, usernameCheck);
    });
    usernameInput.addEventListener("input", () => {
        let count = 0;
        if (usernameInput.value != "") {
            count++;
        }
        if (usernameInput.value.length <= 150) {
            count++;
        }
        let pattern = /([^-_a-z0-9])+/i;
        let result = pattern.test(usernameInput.value);
        if (result === false) {
            count++;
        }
        if (usernameInput.value != username) {
            count++;
        }
        let isValid = (count === 4) ? true : false;
        usernameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    });
    // Event listeners for first name input
    firstNameInput.addEventListener("focus", () => {
        userHelp(firstNameInput);
    });
    firstNameInput.addEventListener("blur", () => {
        userHelp(firstNameInput);
        styleAsInvalid(firstNameInput, firstNameCheck);
    });
    firstNameInput.addEventListener("input", () => {
        let count = 0;
        if (firstNameInput.value.length <= 150) {
            count++;
        }
        if (firstNameInput.value != firstName) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        firstNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    });
    // Event listeners for last name input
    lastNameInput.addEventListener("focus", () => {
        userHelp(lastNameInput);
    });
    lastNameInput.addEventListener("blur", () => {
        userHelp(lastNameInput);
        styleAsInvalid(lastNameInput, lastNameCheck);
    });
    lastNameInput.addEventListener("input", () => {
        let count = 0;
        if (lastNameInput.value.length <= 150) {
            count++;
        }
        if (lastNameInput.value != lastName) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        lastNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    });
    // Event listeners for email input
    emailInput.addEventListener("focus", () => {
        userHelp(emailInput);
    });
    emailInput.addEventListener("blur", () => {
        userHelp(emailInput);
        styleAsInvalid(emailInput, emailCheck);
    });
    emailInput.addEventListener("input", () => {
        let count = 0;
        if (emailInput.value != "") {
            count++;
        }
        let pattern = /([@])/;
        let result = pattern.test(emailInput.value);
        if (result === true) {
            count++;
        }
        if (emailInput.value != email) {
            count++;
        }
        let isValid = (count === 3) ? true : false;
        emailCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    });
});
