$(document).ready(() => {
    getWaterChartData(function (result) {
        a = result;
    });
    console.log(a)
});
let a;
let waterChartData = [];
let powerChartData = [];
let gasChartData = [];

function getWaterChartData(callback) {
    let query = `SELECT zaehlernummer, verbrauch, DATE_FORMAT(datum,\"%Y-%m-%d\") AS formatDate
                FROM zaehlerstand
                WHERE zaehlertyp_id = 1;`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        Array.from(result).forEach((row) => {
            //get unix timestamp in ms
            let part = row.formatDate.split("-", 3);
            let timestamp = new Date(part[0], part[1], part[2]).getTime();

            //write to subarray
            let subArray = [timestamp, row.verbrauch];
            waterChartData.push(subArray);
        });
        let seriesData = [{
            values: waterChartData,
            lineColor: '#4db6ac',
            marker: {
                backgroundColor: '#4db6ac'
            }
        }];
        return callback(seriesData);
        //console.log(waterChartData);
    });
    //console.log(waterChartData);

}

var waterConfig = {
    type: 'line',
    backgroundColor: '#fff',
    title: {
        text: 'Wasserverbrauch',
        adjustLayout: true,
        fontColor: "#00000",
        marginTop: 7
    },
    legend: {
        align: 'center',
        verticalAlign: 'top',
        backgroundColor: 'none',
        borderWidth: 0,
        item: {
            fontColor: '#fffff',
            cursor: 'hand'
        },
        marker: {
            type: 'circle',
            borderWidth: 0,
            cursor: 'hand'
        }
    },
    plotarea: {
        margin: 'dynamic 70'
    },
    plot: {
        aspect: 'segmented',
        lineWidth: 2,
        marker: {
            borderWidth: 0,
            size: 5
        }
    },
    scaleX: {
        zooming: true,
        zoomTo: [0, 15],
        minValue: 1483228801000,
        step: 'day',
        item: {
            fontColor: '#00000'
        },
        transform: {
            type: 'date',
            all: '%dd.%mm.%y'
        },
        lineStyle: "solid"
    },
    scaleY: {
        minorTicks: 1,
        tick: {
            lineColor: '#00000'
        },
        minorTick: {
            lineColor: '#00000'
        },
        minorGuide: {
            visible: true,
            lineWidth: 1,
            lineColor: '#E3E3E5',
            alpha: 0.7,
            lineStyle: 'dashed'
        },
        guide: {
            lineStyle: 'dashed'
        },
        item: {
            fontColor: '#00000'
        }
    },
    tooltip: {
        borderWidth: 0,
        borderRadius: 3
    },
    preview: {
        adjustLayout: true,
        borderColor: '#E3E3E5',
        mask: {
            backgroundColor: '#E3E3E5'
        }
    },
    crosshairX: {
        plotLabel: {
            multiple: true,
            borderRadius: 3
        },
        scaleLabel: {
            backgroundColor: '#53535e',
            borderRadius: 3
        },
        marker: {
            size: 7,
            alpha: 0.5
        }
    },
    crosshairY: {
        lineColor: '#E3E3E5',
        type: 'multiple',
        scaleLabel: {
            decimals: 2,
            borderRadius: 3,
            offsetX: -5,
            fontColor: "#2C2C39",
            bold: true
        }
    },
    shapes: [{
        type: 'rectangle',
        id: 'view_all',
        height: '20px',
        width: '75px',
        borderColor: '#E3E3E5',
        borderWidth: 1,
        borderRadius: 3,
        x: '85%',
        y: '11%',
        backgroundColor: '#53535e',
        cursor: 'hand',
        label: {
            text: 'View All',
            fontColor: '#E3E3E5',
            fontSize: 12,
            bold: true
        }
    }],
    series: getWaterChartData()
    /*[{
            values: [
                [1546300801000, 100],
                [1546387201000, 200],
                [1546560001000, 400],
                [1546646401000, 800]
            ],
            lineColor: '#4db6ac',
            marker: {
                backgroundColor: '#4db6ac'
            }
        }]*/
};

zingchart.bind('waterChart', 'shape_click', function (p) {
    if (p.shapeid == "view_all") {
        zingchart.exec(p.id, 'viewall');
    }
})

zingchart.render({
    id: 'waterChart',
    data: waterConfig,
});