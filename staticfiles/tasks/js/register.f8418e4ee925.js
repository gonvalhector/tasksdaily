function userHelp(element) {
    /*
    Select the small element with tips
    next to the input element that triggered
    the event and make it visible or hidden.
    */
    let tip;
    if (element.next().attr("id") === undefined) {
        let whitespace = element.next();
        tip = whitespace.next();
    }
    else {
        tip = element.next();
    }
    let className = element.attr("class");
    let subStr = " invalid";
    if (className.includes(subStr) === true) {
        tip.show();
    }
    else {
        tip.toggle();
    }
}

function submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = (usernameCheck && firstNameCheck && lastNameCheck && emailCheck && passwordCheck && passwordConfirmCheck === true) ? false : true;
    $("#submit").prop("disabled", submit);
}

function styleAsInvalid(element, check) {
    /*
    Add the invalid class to elements that have an
    input check of false.
    */
    let className = element.attr("class");
    let subStr = " invalid";
    let tip;
    if (element.next().attr("id") === undefined) {
        let whitespace = element.next();
        tip = whitespace.next();
    }
    else {
        tip = element.next();
    }
    // Add the invalid class if the element does not have it yet
    if (check === false) {
        if (className.includes(subStr) === false) {
            className = className + " invalid";
            element.attr("class", className)
            tip.show();
        }
    }
    // Remove the invalid class if the element does not need it anymore
    else {
        if (className.includes(subStr) === true) {
            className = className.replace(subStr, "");
            element.attr("class", className)
            tip.hide();
        }
    }
}

$(function() {
    // Select username input and small text elements
    let usernameInput = $("#username");
    let usernameHelp = $("#usernameHelp");
    // Hide small text help for user input
    usernameHelp.hide();
    // Set username input check to false
    let usernameCheck = false;
    // Select first name input and small text elements
    let firstNameInput = $("#first_name");
    let firstNameHelp = $("#firstNameHelp");
    // Hide small text help for first name input
    firstNameHelp.hide();
    // Set first name input check to true because it's optional
    let firstNameCheck = true;
    // Select last name input and small text elements
    let lastNameInput = $("#last_name");
    let lastNameHelp = $("#lastNameHelp");
    // Hide small text help for last name input
    lastNameHelp.hide();
    // Set last name input check to true because it's optional
    let lastNameCheck = true;
    // Select email input and small text elements
    let emailInput = $("#email");
    let emailHelp = $("#emailHelp");
    // Hide small text help for email input
    emailHelp.hide();
    // Set email input check to false
    let emailCheck = false;
    // Select password input and small text elements
    let passwordInput = $("#password");
    let passwordHelp = $("#passwordHelp");
    // Hide small text help for password input
    passwordHelp.hide();
    // Set password input check to false
    let passwordCheck = false;
    // Select password confirm input
    let passwordConfirmInput = $("#password_confirm");
    // Set password confirm input check to false
    let passwordConfirmCheck = false;
    // Disable submit button
    submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    // Events for username input
    usernameInput.on("focus", function() {
        userHelp(usernameInput);
    });
    usernameInput.on("blur", function() {
        userHelp(usernameInput);
        styleAsInvalid(usernameInput, usernameCheck);
    });
    usernameInput.on("input", function() {
        let count = 0;
        if (usernameInput.val() != "") {
            count++;
        }
        if (usernameInput.val().length <= 150) {
            count++;
        }
        let pattern = /([^-_a-z0-9])+/i;
        let result = pattern.test(usernameInput.val());
        if (result === false) {
            count++;
        }
        let isValid = (count === 3) ? true : false;
        usernameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
    // Events for first name input
    firstNameInput.on("focus", function() {
        userHelp(firstNameInput);
    });
    firstNameInput.on("blur", function() {
        userHelp(firstNameInput);
        styleAsInvalid(firstNameInput, firstNameCheck);
    });
    firstNameInput.on("input", function() {
        let isValid = (firstNameInput.val().length <= 150) ? true : false;
        firstNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
    // Events for last name input
    lastNameInput.on("focus", function() {
        userHelp(lastNameInput);
    });
    lastNameInput.on("blur", function() {
        userHelp(lastNameInput);
        styleAsInvalid(lastNameInput, lastNameCheck);
    });
    lastNameInput.on("input", function() {
        let isValid = (lastNameInput.val().length <= 150) ? true : false;
        lastNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
    // Events for email input
    emailInput.on("focus", function() {
        userHelp(emailInput);
    });
    emailInput.on("blur", function() {
        userHelp(emailInput);
        styleAsInvalid(emailInput, emailCheck);
    });
    emailInput.on("input", function() {
        let count = 0;
        if (emailInput.val() != "") {
            count++;
        }
        let pattern = /([@])/;
        let result = pattern.test(emailInput.val());
        if (result === true) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        emailCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
    // Events for password input
    passwordInput.on("focus", function() {
        userHelp(passwordInput);
    });
    passwordInput.on("blur", function() {
        userHelp(passwordInput);
        styleAsInvalid(passwordInput, passwordCheck);
    });
    passwordInput.on("input", function() {
        let count = 0;
        if (passwordInput.val().length >= 8) {
            count++;
        }
        let pattern = /\D/;
        let result = pattern.test(passwordInput.val());
        if (result === true) {
            count++;
        }
        if (passwordInput.val() !== usernameInput.val()) {
            count++;
        }
        if (passwordInput.val() !== firstNameInput.val()) {
            count++;
        }
        if (passwordInput.val() !== lastNameInput.val()) {
            count++;
        }
        if (passwordInput.val() !== emailInput.val()) {
            count++;
        }
        let isValid = (count === 6) ? true : false;
        passwordCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
    // Events for password confirm input
    passwordConfirmInput.on("blur", function() {
        styleAsInvalid(passwordConfirmInput, passwordConfirmCheck);
    });
    passwordConfirmInput.on("input", function() {
        let count = 0;
        if (passwordConfirmInput.val() === passwordInput.val()) {
            count++;
        }
        let isValid = (count === 1) ? true : false;
        passwordConfirmCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck, passwordCheck, passwordConfirmCheck);
    });
});
