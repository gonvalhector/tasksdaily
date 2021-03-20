function drawChart() {
    /*
    Callback that creates and populates a data table,
    instantiates the column chart, passes in the data and
    draws it
    */

    // Declare viewport view
    let vWidth = window.innerWidth;
    // Define chart width according to viewport width
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
    // Iterate over each category
    $(".categories").each(function(index, element) {
        let categoryName = $(this).attr("data-name");
        let tasksCategory = categoryName + "-" + "tasks";
        // Draw a chart for every task
        $(`.${tasksCategory}`).each(function(i, el) {
            let task = $(this);
            let taskName = task.attr("data-name");
            let taskComplete = Number(task.attr("data-complete"));
            let taskIncomplete = Number(task.attr("data-incomplete"));
            let taskIgnored = Number(task.attr("data-ignored"));
            let taskPending = Number(task.attr("data-pending"));

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
                    "color": "#403D39",
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
        });
    });
}

$(function() {
        // Remove the default list of stats
        $("#raw-stats").remove();
        // Show the stats to fill with the charts
        $("#graphs-stats").toggle();
        if ($(".categories").length > 0) {
            // Load the Visualization API and the corechart package.
            google.charts.load('current', {'packages':['corechart']});
            // Set a callback to run when the Google Visualization API is loaded.
            google.charts.setOnLoadCallback(drawChart);
        }
});
