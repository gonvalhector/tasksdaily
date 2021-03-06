function changeIcon() {
    /*
    Change the image button or icon for the
    collapsible element when clicked
    */
    let src = $(this).attr("src");
    // If the button represents an expanded element
    if ($(this).attr("src") == "/static/tasks/images/icons/expand.svg") {
        // Change to contracted
        $(this).attr({
            src: "/static/tasks/images/icons/contract.svg",
            alt: "Contract",
            title: "Contract"
        });
    }
    // If the button represents a contracted element
    else {
        // Change to expanded
        $(this).attr({
            src: "/static/tasks/images/icons/expand.svg",
            alt: "Expand",
            title: "Expand"
        });
    }
}

$(document).ready(function() {
    // Get all image buttons
    let expandIcons = $(".expandable");
    // Iterate over each button
    $(".expandable").each(function(index, element) {
        // Call changeIcon when a button is clicked
        $(this).click(changeIcon);
    });
});
