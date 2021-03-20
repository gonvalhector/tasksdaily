function changeIcon() {
    let src = $(this).attr("src");
    if ($(this).attr("src") == "/static/tasks/images/icons/expand.svg") {
        $(this).attr({
            src: "/static/tasks/images/icons/contract.svg",
            alt: "Contract",
            title: "Contract"
        });
    }
    else {
        $(this).attr({
            src: "/static/tasks/images/icons/expand.svg",
            alt: "Expand",
            title: "Expand"
        });
    }
}

$(document).ready(function() {
    let expandIcons = $(".expandable");
    $(".expandable").each(function(index, element) {
        //iterate through array or object
        $(this).click(changeIcon);
    });
});
