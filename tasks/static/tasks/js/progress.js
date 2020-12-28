document.addEventListener("DOMContentLoaded", () => {
    let submit = document.getElementById("submit");
    submit.disabled = true;
    let querySelect = document.getElementById("query");
    querySelect.addEventListener("change", () => {
        submit.disabled = false;
    });
});
