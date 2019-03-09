$(document).ready(() => {
    initWaterChart();
    initPowerChart();
    initGasChart();
});

function initWaterChart() {
    let query = `SELECT zaehlernummer, verbrauch, DATE_FORMAT(datum,\"%Y-%m-%d\") AS formatDate
                FROM zaehlerstand
                WHERE zaehlertyp_id = 1
                ORDER BY datum;`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        let valueArr = [];
        let counterNr;
        Array.from(result).forEach((row, index) => {
            //get unix timestamp in ms
            let part = row.formatDate.split("-", 3);
            let timestamp = new Date(part[0], part[1], part[2]).getTime();

            if (index === 0) { //set min value for chart
                waterConfig.scaleX.minValue = timestamp;
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
        waterConfig.series = seriesData;

        zingchart.render({
            id: 'waterChart',
            data: waterConfig,
        });
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

function initPowerChart() {
    let query = `SELECT zaehlernummer, verbrauch, DATE_FORMAT(datum,\"%Y-%m-%d\") AS formatDate
                FROM zaehlerstand
                WHERE zaehlertyp_id = 2
                ORDER BY datum;`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        let valueArr = [];
        let counterNr;
        Array.from(result).forEach((row, index) => {
            //get unix timestamp in ms
            let part = row.formatDate.split("-", 3);
            let timestamp = new Date(part[0], part[1], part[2]).getTime();

            if (index === 0) { //set min value for chart
                powerConfig.scaleX.minValue = timestamp;
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
        powerConfig.series = seriesData;

        zingchart.render({
            id: 'powerChart',
            data: powerConfig,
        });
    });
}

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

function initGasChart() {
    let query = `SELECT zaehlernummer, verbrauch, DATE_FORMAT(datum,\"%Y-%m-%d\") AS formatDate
                FROM zaehlerstand
                WHERE zaehlertyp_id = 3
                ORDER BY datum;`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        let valueArr = [];
        let counterNr;
        Array.from(result).forEach((row, index) => {
            //get unix timestamp in ms
            let part = row.formatDate.split("-", 3);
            let timestamp = new Date(part[0], part[1], part[2]).getTime();

            if (index === 0) { //set min value for chart
                gasConfig.scaleX.minValue = timestamp;
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
        gasConfig.series = seriesData;

        zingchart.render({
            id: 'gasChart',
            data: gasConfig,
        });
    });
}

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