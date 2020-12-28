function submitState(usernameCheck, passwordCheck) {
    /*
    Disable or enable the submit button according to the
    state of the input checks.
    */
    let submit = document.getElementById("submit");
    submit.disabled = (usernameCheck && passwordCheck === true) ? false : true;
}

document.addEventListener("DOMContentLoaded", () => {
    // Select username input and set check to false
    let usernameInput = document.getElementById("username");
    let usernameCheck = false;
    // Select password input and set check to false
    let passwordInput = document.getElementById("password");
    let passwordCheck = false;
    // Disable submit button
    submitState(usernameCheck, passwordCheck);
    // When the user changes the value of the username input
    usernameInput.addEventListener("input", () => {
        // Check that input value is not an empty string
        usernameCheck = (usernameInput.value != "" && usernameInput.value.length <= 150) ? true : false;
        submitState(usernameCheck, passwordCheck);
    });
    // When the username input loses focus
    usernameInput.addEventListener("blur", submitState(usernameCheck, passwordCheck), false);
    // When the user changes the value of the password input
    passwordInput.addEventListener("input", () => {
        // Check that input value is not an empty string
        passwordCheck = (passwordInput.value != "" && passwordInput.value.length >= 8) ? true : false;
        submitState(usernameCheck, passwordCheck);
    });
    // When the password input loses focus
    passwordInput.addEventListener("blur", submitState(usernameCheck, passwordCheck), false);
});
