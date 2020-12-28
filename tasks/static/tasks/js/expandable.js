function changeIcon() {
/*
Change the image button or icon for the
collapsible element when clicked
*/
    let src = this.getAttribute("src");
    if (src == "/static/tasks/images/icons/expand.svg") {
        this.setAttribute("src", "/static/tasks/images/icons/contract.svg");
        this.setAttribute("alt", "Contract");
        this.setAttribute("title", "Contract");
    }
    else {
        this.setAttribute("src", "/static/tasks/images/icons/expand.svg");
        this.setAttribute("alt", "Expand");
        this.setAttribute("title", "Expand");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let expandIcons = document.getElementsByClassName("expandable");
    for (let i = 0; i < expandIcons.length; i++) {
        let expandIcon = expandIcons.item(i);
        expandIcon.addEventListener("click", changeIcon, false);
    }
});
