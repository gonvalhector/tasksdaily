document.addEventListener("DOMContentLoaded", () => {
    let timezoneSelect = document.getElementById("timezone");
    let timezone = timezoneSelect.value;
    let submit = document.getElementById("submit");
    submit.disabled = true;
    timezoneSelect.addEventListener("change", () => {
        submit.disabled = (timezoneSelect.value === timezone) ? true : false;
    });
});
