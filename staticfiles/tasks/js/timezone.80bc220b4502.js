$(document).ready(function() {
    // Disable submit button
    $("#submit").prop("disabled", true);
    // Get original timezone value
    let timezone = $("#timezone").val();
    // When the selected timezone is changed
    $("#timezone").change(function() {
        // If the timezone is different enable submit button
        // If the timezone is the same disable submit button
        let tz = ($(this).val() === timezone) ? true : false;
        $("#submit").prop("disabled", tz);
    });
});
