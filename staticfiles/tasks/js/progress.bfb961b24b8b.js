$(document).ready(function() {
    // Disable submit button
    $("#submit").prop("disabled", true);
    $("#query").change(function() {
        $("#submit").prop("disabled", false);
    })
});
