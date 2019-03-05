//wasser dummy
/*
let ctx = document.getElementById("wasserChart").getContext("2d");
let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
*/

//time data
let data = [{
    x: new Date(2018, 0, 1),
    y: 1
}, {
    x: new Date(2019, 0, 1),
    y: 10
}];
console.log(data)

//gas line chart
let gasCanvas = document.getElementById("gasChart").getContext("2d");
var gasLineChart = new Chart(gasCanvas, {
    type: 'line',
    data: {
        labels: ["2017", "2018", "2019"],
        datasets: [data],
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
                time: {
                    unit: "day",
                    unitStepSize: 1,
                    displayFormats: {
                        "day": "D M YYYY",
                        "month": "MMM YYYY"
                    }
                }
            }]
        }
    }
});