/*
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", () => {
        let timezoneSelect = document.getElementById("timezone");
        let timezone = timezoneSelect.value;
        let submit = document.getElementById("submit");
        submit.disabled = true;
            timezoneSelect.addEventListener("change", () => {
                submit.disabled = (timezoneSelect.value === timezone) ? true : false;
            });
    });
}
else {
    document.attachEvent("onreadystatechange", function() {
        let timezoneSelect = document.getElementById("timezone");
        let timezone = timezoneSelect.value;
        let submit = document.getElementById("submit");
        submit.disabled = true;
            timezoneSelect.attachEvent("onchange", function() {
                submit.disabled = (timezoneSelect.value === timezone) ? true : false;
            });
    });
}
*/
$(document).ready(function() {
    $("#submit").prop("disabled", true);
    let timezone = $("#timezone").val();
    alert(timezone);
});
