const moment = require("moment");

/*
//time data
let data = [{
    x: new Date(2018, 0, 1),
    y: 1

}, {
    x: new Date(2019, 0, 1),
    y: 10
}, {
    x: new Date(2020, 0, 1),
    y: 100
}];
let data1 = [{
    x: moment.moment("2017-01-01"),
    y: 1

}, {
    x: moment("2018-01-01"),
    y: 10
}, {
    x: moment("2019-01-01"),
    y: 100
}];
console.log(data1);
let dataset0 = {
    label: "Gas",
    data: [data1]
};

//gas line chart
let gasCanvas = document.getElementById("gasChart").getContext("2d");
var gasLineChart = new Chart(gasCanvas, {
    type: 'line',
    data: {
        labels: ["2017", "2018", "2019", "2020"],
        datasets: [dataset0]
    },
    options: {
        title: {
            display: true,
            text: "Gasverbrauch",
            fontSize: 24
        },
        scales: {
            xAxes: [{
                type: "time",
                ticks: {
                    callback: function (value) {
                        return new Date(value).toLocaleDateString("de-DE", {
                            month: "short",
                            year: "numeric"
                        });
                    },
                    source: "data"
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
*/