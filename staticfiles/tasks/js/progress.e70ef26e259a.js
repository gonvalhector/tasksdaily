$(function() {
    // Declare variables
    let $submit = $("#submit");
    // Disable submit button
    $submit.prop("disabled", true);
    $("#query").on("change", function() {
        $submit.prop("disabled", false);
    });
});
