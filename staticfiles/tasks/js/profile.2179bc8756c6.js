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
        alert(tip.attr("hidden"));
        if (tip.attr("hidden") === true) {
            tip.show();
        }
        else {
            tip.hide();
        }
    }
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
            className =  className + " invalid";
            element.attr("class", className);
            tip.show();
        }
    }
    // Remove the invalid class if the element does not need it anymore
    else {
        if (className.includes(subStr) === true) {
            className = className.replace(subStr, "");
            element.attr("class", className);
            tip.hide();
        }
    }
}

function submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = (usernameCheck || firstNameCheck || lastNameCheck || emailCheck === true) ? false : true;
    $("#submit").prop("disabled", submit);
}

$(function() {
    // Declare username related variables
    let usernameInput = $("#username");
    let username = usernameInput.val();
    let usernameHelp = $("#usernameHelp");
    let usernameCheck = false;
    // Hide small text help for user input
    usernameHelp.hide();
    // Declare first name related variables
    let firstNameInput = $("#first_name");
    let firstName = firstNameInput.val();
    let firstNameHelp = $("#firstNameHelp");
    let firstNameCheck = false;
    // Hide small text help for first name input
    firstNameHelp.hide();
    // Declare last name related variables
    let lastNameInput = $("#last_name");
    let lastName = lastNameInput.val();
    let lastNameHelp = $("#lastNameHelp");
    let lastNameCheck = false;
    // Hide small text help for last name input
    lastNameHelp.hide();
    // Declare email related variables
    let emailInput = $("#email");
    let email = emailInput.val();
    let emailHelp = $("#emailHelp");
    let emailCheck = false;
    // Hide small text help for email input
    emailHelp.hide();
    // Disable submit button
    submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
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
        if (usernameInput.val() != username) {
            count++;
        }
        let isValid = (count === 4) ? true : false;
        usernameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
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
        let count = 0;
        if (firstNameInput.val().length <= 150) {
            count++;
        }
        if (firstNameInput.val() != firstName) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        firstNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    });
    // Events for last name input
    lastNameInput.on("focus", function() {
        userHelp(lastNameInput)
    });
    lastNameInput.on("blur", function() {
        userHelp(lastNameInput);
        styleAsInvalid(lastNameInput, lastNameCheck);
    });
    lastNameInput.on("input", function() {
        let count = 0;
        if (lastNameInput.val().length <= 150) {
            count++;
        }
        if (lastNameInput.val() != lastName) {
            count++;
        }
        let isValid = (count === 2) ? true : false;
        lastNameCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    });
    // Events for email input
    emailInput.on("focus", function() {
        userHelp(emailInput)
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
        if (emailInput.val() != email) {
            count++;
        }
        let isValid = (count === 3) ? true : false;
        emailCheck = isValid;
        submitState(usernameCheck, firstNameCheck, lastNameCheck, emailCheck);
    });
});
