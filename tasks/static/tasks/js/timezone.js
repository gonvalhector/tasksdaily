$(function() {
    // Declare variables
    let $submit = $("#submit");
    let $timezone = $("#timezone");
    // Disable submit button
    submit.prop("disabled", true);
    // Get original timezone value
    let og_timezone = $timezone.val();
    // When the selected timezone is changed
    $timezone.on("change", function() {
        // If the timezone is different enable submit button
        // If the timezone is the same disable submit button
        let tz = ($(this).val() === og_timezone) ? true : false;
        $submit.prop("disabled", tz);
    });
});
