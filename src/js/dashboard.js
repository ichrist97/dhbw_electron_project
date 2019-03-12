$(document).ready(() => {
    initChart("waterChart", waterConfig);
    initChart("powerChart", powerConfig);
    initChart("gasChart", gasConfig);
});

function getChartData(typeId) {
    return new Promise((resolve, reject) => {
        let query = `SELECT zaehlernummer, verbrauch, DATE_FORMAT(datum,\"%Y-%m-%d\") AS formatDate
                FROM zaehlerstand
                WHERE zaehlertyp_id = ${typeId}
                ORDER BY datum;`;

        connection.query(query, (err, rows, fields) => {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function initChart(chartId, chartConfig) {
    let typeId;
    switch (chartId) {
        case "waterChart":
            typeId = 1;
            break;
        case "powerChart":
            typeId = 2;
            break;
        case "gasChart":
            typeId = 3;
            break;
    }
    getChartData(typeId).then((rows) => {
        let valueArr = [];
        let counterNr;

        Array.from(rows).forEach((row, index) => {
            //get unix timestamp in ms
            let part = row.formatDate.split("-", 3);
            let timestamp = new Date(part[0], part[1], part[2]).getTime();

            if (index === 0) { //set min value for chart
                chartConfig.scaleX.minValue = timestamp;
            }

            //write to subarray
            let subArray = [timestamp, row.verbrauch];
            valueArr.push(subArray);

            counterNr = row.zaehlernummer;
        });

        let seriesData = [{
            values: valueArr,
            text: counterNr,
            lineColor: '#4db6ac',
            marker: {
                backgroundColor: '#4db6ac'
            }
        }];
        chartConfig.series = seriesData;

        zingchart.render({
            id: chartId,
            data: chartConfig,
        });
    }).catch((err) => setImmediate(() => {
        throw err;
    })); // Throw async to escape the promise chain
}

function refreshChart(chartType, entry, counterNr) {
    let graphId;
    switch (chartType) {
        case "Wasser":
            graphId = "waterChart";
            break;
        case "Strom":
            graphId = "powerChart";
            break;
        case "Gas":
            graphId = "gasChart";
            break;
        default:
            graphId = null;
            break;
    }
    console.log(entry);

    //get unix timestamp in ms
    let part = entry.date.split("-", 3);
    let timestamp = new Date(part[0], part[1], part[2]).getTime();

    //append value to char
    zingchart.exec(graphId, 'appendseriesvalues', {
        plotindex: 0,
        values: [
            [timestamp, parseInt(entry.amount)]
        ]
    });
}

let waterConfig = {
    type: 'line',
    backgroundColor: '#fff',
    title: {
        text: 'Wasserverbrauch',
        adjustLayout: true,
        fontColor: "#00000",
        marginTop: 7,
        fontSize: 30
    },
    legend: {
        align: 'center',
        verticalAlign: 'top',
        backgroundColor: 'none',
        borderWidth: 1,
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
            size: 6
        }
    },
    scaleX: {
        label: {
            text: "Zeitraum"
        },
        zooming: true,
        minValue: null,
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
        label: {
            text: "Verbrauch"
        },
        format: "%v m³",
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
        height: '20pt',
        width: '200pt',
        borderColor: '#E3E3E5',
        borderWidth: 1,
        borderRadius: 3,
        x: '85%',
        y: '11%',
        backgroundColor: '#644d6c',
        cursor: 'hand',
        label: {
            text: 'Gesamten Zeitraum anzeigen',
            fontColor: '#FFF',
            fontSize: 12,
            bold: true
        }
    }],
    series: null
};

zingchart.bind('waterChart', 'shape_click', function (p) {
    if (p.shapeid == "view_all") {
        zingchart.exec(p.id, 'viewall');
    }
});

let powerConfig = {
    type: 'line',
    backgroundColor: '#fff',
    title: {
        text: 'Stromverbrauch',
        adjustLayout: true,
        fontColor: "#00000",
        marginTop: 7,
        fontSize: 30
    },
    legend: {
        align: 'center',
        verticalAlign: 'top',
        backgroundColor: 'none',
        borderWidth: 1,
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
        label: {
            text: "Zeitraum"
        },
        zooming: true,
        minValue: null,
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
        label: {
            text: "Verbrauch"
        },
        format: "%v kWh",
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
        height: '20pt',
        width: '200pt',
        borderColor: '#E3E3E5',
        borderWidth: 1,
        borderRadius: 3,
        x: '85%',
        y: '11%',
        backgroundColor: '#644d6c',
        cursor: 'hand',
        label: {
            text: 'Gesamten Zeitraum anzeigen',
            fontColor: '#FFF',
            fontSize: 12,
            bold: true
        }
    }],
    series: null
};

zingchart.bind('powerChart', 'shape_click', function (p) {
    if (p.shapeid == "view_all") {
        zingchart.exec(p.id, 'viewall');
    }
});

let gasConfig = {
    type: 'line',
    backgroundColor: '#fff',
    title: {
        text: 'Gasverbrauch',
        adjustLayout: true,
        fontColor: "#00000",
        marginTop: 7,
        fontSize: 30
    },
    legend: {
        align: 'center',
        verticalAlign: 'top',
        backgroundColor: 'none',
        borderWidth: 1,
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
        label: {
            text: "Zeitraum"
        },
        zooming: true,
        minValue: null,
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
        label: {
            text: "Verbrauch"
        },
        format: "%v kWh",
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
        height: '20pt',
        width: '200tp',
        borderColor: '#E3E3E5',
        borderWidth: 1,
        borderRadius: 3,
        x: '85%',
        y: '11%',
        backgroundColor: '#644d6c',
        cursor: 'hand',
        label: {
            text: 'Gesamten Zeitraum anzeigen',
            fontColor: '#FFF',
            fontSize: 12,
            bold: true
        }
    }],
    series: null
};

zingchart.bind('gasChart', 'shape_click', function (p) {
    if (p.shapeid == "view_all") {
        zingchart.exec(p.id, 'viewall');
    }
});