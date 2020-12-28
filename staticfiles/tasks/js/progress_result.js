// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {
    let vWidth = window.innerWidth;
    let width;
    switch(true) {
        case (vWidth >= 0 && vWidth < 241):
            width = 210;
            break;
        case (vWidth >= 241 && vWidth < 360):
            width = 260;
            break;
        case (vWidth >= 360 && vWidth < 411):
            width = 320;
            break;
        case (vWidth >= 411 && vWidth < 600):
            width = 360;
            break;
        case (vWidth >= 600 && vWidth < 768):
            width = 500;
            break;
        case (vWidth >= 768 && vWidth < 1024):
            width = 700;
            break;
        case (vWidth >= 1024 && vWidth < 1920):
            width = 800;
            break;
        case (vWidth >= 1920 && vWidth < 2560):
            width = 1024;
    }
    let categories = document.getElementsByClassName("categories");
    for (let i = 0; i < categories.length; i++) {
        let categoryName = categories.item(i).dataset.name;
        let tasksCategory = categoryName + "-" + "tasks";
        let tasks = document.getElementsByClassName(tasksCategory);
        for (let j = 0; j < tasks.length; j++) {
            let task = tasks.item(j);
            let taskName = task.dataset.name;
            let taskComplete = Number(task.dataset.complete);
            let taskIncomplete = Number(task.dataset.incomplete);
            let taskIgnored = Number(task.dataset.ignored);
            let taskPending = Number(task.dataset.pending);

            // Create the data table.
            var data = new google.visualization.arrayToDataTable([
                ["Status", "Logs", {role: "style"}],
                ["Completed", taskComplete, "#D6BB57"],
                ["Incompleted", taskIncomplete, "#C0C0C0"],
                ["Ignored", taskIgnored, "#BE8046"],
                ["Pending", taskPending, "#868179"]
            ]);

            // Set chart options
            var options = {
                "title": taskName,
                "titleTextStyle": {
                    "color": "#403d39",
                    "fontSize": 15
                },
                "width": width,
                "height": width - width / 4,
                "legend": {"position": "none"},
                "backgroundColor": "#E6E1D6",
                "animation": {
                    "duration": 1000,
                    "easing": "in",
                    "startup": true
                },
                "vAxis": {
                    "format": "short"
                }
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById(taskName));
            chart.draw(data, options);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let raw = document.getElementById("raw-stats");
    raw.remove();
    let graphs = document.getElementById("graphs-stats");
    graphs.hidden = false;
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);
});
