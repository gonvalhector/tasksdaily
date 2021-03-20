function submitState(usernameCheck, passwordCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = (usernameCheck && passwordCheck === true) ? false : true;
    $("#submit").prop("disabled", submit);
}

$(function() {
    // Select username input and set check to false
    let usernameInput = $("#username");
    let usernameCheck = false;
    // Select password input and set check to false
    let passwordInput = $("#password");
    let passwordCheck = false;
    // Disable submit button
    submitState(usernameCheck, passwordCheck);
    // When the user changes the value of the username input
    usernameInput.on("input", function() {
        // Check that input value is not an empty string
        usernameCheck = (usernameInput.val() != "" && usernameInput.val().length <= 150) ? true : false;
        submitState(usernameCheck, passwordCheck);
    });
    // When the username input loses focus
    usernameInput.on("blur", submitState(usernameCheck, passwordCheck));
    // When the user changes the value of the password input
    passwordInput.on("input", function() {
        // Check that input value is not an empty string
        passwordCheck = (passwordInput.val() != "" && passwordInput.val().length >= 8) ? true : false;
        submitState(usernameCheck, passwordCheck);
    });
    // When the password input loses focus
    passwordInput.on("blur", submitState(usernameCheck, passwordCheck));
});
