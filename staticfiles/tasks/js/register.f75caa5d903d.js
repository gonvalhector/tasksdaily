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

function submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = document.getElementById("submit");
    submit.disabled = (usernameCheck && firstNameCheck && lastNameCheck && emailCheck && passwordCheck && passwordConfirmCheck === true) ? false : true;
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

document.addEventListener("DOMContentLoaded", () => {
    // Select username input and small text elements
    let usernameInput = document.getElementById("username");
    let usernameHelp = document.getElementById("usernameHelp");
    // Hide small text help for user input
    usernameHelp.hidden = true;
    // Set username input check to false
    let usernameCheck = false;
    // Select first name input and small text elements
    let firstNameInput = document.getElementById("first_name");
    let firstNameHelp = document.getElementById("firstNameHelp");
    // Hide small text help for first name input
    firstNameHelp.hidden = true;
    // Set first name input check to true because it's optional
    let firstNameCheck = true;
    // Select last name input and small text elements
    let lastNameInput = document.getElementById("last_name");
    let lastNameHelp = document.getElementById("lastNameHelp");
    // Hide small text help for last name input
    lastNameHelp.hidden = true;
    // Set last name input check to true because it's optional
    let lastNameCheck = true;
    // Select email input and small text elements
    let emailInput = document.getElementById("email");
    let emailHelp = document.getElementById("emailHelp");
    // Hide small text help for email input
    emailHelp.hidden = true;
    // Set email input check to false
    let emailCheck = false;
    // Select password input and small text elements
    let passwordInput = document.getElementById("password");
    let passwordHelp = document.getElementById("passwordHelp");
    // Hide small text help for password input
    passwordHelp.hidden = true;
    // Set password input check to false
    let passwordCheck = false;
    // Select password confirm input
    let passwordConfirmInput = document.getElementById("password_confirm");
    // Set password confirm input check to false
    let passwordConfirmCheck = false;
    // Disable submit button
    submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
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
        let isValid = (count === 3) ? true : false;
        usernameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
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
        let isValid = (firstNameInput.value.length <= 150) ? true : false;
        firstNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
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
        let isValid = (lastNameInput.value.length <= 150) ? true : false;
        lastNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
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
        let isValid = (count === 2) ? true : false;
        emailCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
    // Event listeners for password input
    passwordInput.addEventListener("focus", () => {
        userHelp(passwordInput);
    });
    passwordInput.addEventListener("blur", () => {
        userHelp(passwordInput);
        styleAsInvalid(passwordInput, passwordCheck);
    });
    passwordInput.addEventListener("input", () => {
        let count = 0;
        if (passwordInput.value.length >= 8) {
            count++;
        }
        let pattern = /\D/;
        let result = pattern.test(passwordInput.value);
        if (result === true) {
            count++;
        }
        if (passwordInput.value !== usernameInput.value) {
            count++;
        }
        if (passwordInput.value !== firstNameInput.value) {
            count++;
        }
        if (passwordInput.value !== lastNameInput.value) {
            count++;
        }
        if (passwordInput.value !== emailInput.value) {
            count++;
        }
        let isValid = (count === 6) ? true : false;
        passwordCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
    // Event listeners for password confirm input
    passwordConfirmInput.addEventListener("blur", () => {
        styleAsInvalid(passwordConfirmInput, passwordConfirmCheck);
    });
    passwordConfirmInput.addEventListener("input", () => {
        let count = 0;
        if (passwordConfirmInput.value === passwordInput.value) {
            count++;
        }
        let isValid = (count === 1) ? true : false;
        passwordConfirmCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
});
