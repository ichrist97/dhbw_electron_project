/*
 * Extension from index.js
 * This script handles all calculations relevant to the finanzstatus tab
 * Other actions for dynamic user input reaction are in index.js 
 */

//map which holds whether the gebühren values are present or not [Key: Id of gebühr (String) | Value: Presence (Boolean)]
let valuePresence = new Map();
//init map
Array.from(document.querySelectorAll(".gebühr")).forEach((element) => {
    valuePresence.set(element.id, false);
});
valuePresence.set("wasserGrundgebühr", false);

let periodLength;

//period gets selected
$("#selectPeriod").on("click", () => {
    if (checkPeriod()) {
        let begin = $("#zeitraumVon").val();
        let end = $("#zeitraumBis").val();
        periodLength = getDateDifference(begin, end);
        $("#periodLength").text(periodLength);
        pullDataForWater();
        pullDataForPower();
        pullDataForGas();
    }
});

function getDateDifference(date1, date2) {
    function parseDate(str) {
        let date = str.split('.');
        return new Date(date[2], date[1] - 1, date[0]);
    }

    function datediff(first, second) {
        // Take the difference between the dates and divide by milliseconds per day.
        // Round to nearest whole number to deal with DST.
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    return datediff(parseDate(date1), parseDate(date2));
}

function checkPeriod() {
    let begin = $("#zeitraumVon").val();
    let end = $("#zeitraumBis").val();
    //value empty
    if (!isEmpty(begin) === false || !isEmpty(end) === false) {
        M.toast({
            html: 'Zeitraum nicht ausgewählt'
        });
        return false;
    }
    //value conflict
    let partBegin = begin.split(".");
    let partEnd = end.split(".");
    let beginDate = {
        day: parseInt(partBegin[0]),
        month: parseInt(partBegin[1]),
        year: parseInt(partBegin[2])
    };
    let endDate = {
        day: parseInt(partEnd[0]),
        month: parseInt(partEnd[1]),
        year: parseInt(partEnd[2])
    };
    // console.log(beginDate, endDate);
    //check year
    if (beginDate.year > endDate.year) {
        M.toast({
            html: 'Konflikt: Starttag ist später oder gleich dem Endtag'
        });
        return false;
    }
    //check month
    if (beginDate.month > endDate.month) {
        M.toast({
            html: 'Konflikt: Starttag ist später oder gleich dem Endtag'
        });
        return false;
    }
    //check day
    if (beginDate.day >= endDate.day && beginDate.month > endDate.month && beginDate.year > endDate.year) {
        M.toast({
            html: 'Konflikt: Starttag ist später oder gleich dem Endtag'
        });
        return false;
    }
    //period is valid
    return true;
}

/*
 * Water
 */
function pullDataForWater() {
    let begin = $("#zeitraumVon").val();
    let end = $("#zeitraumBis").val();
    let formatDateBegin = formatDataForSQL(begin);
    let formatDateEnd = formatDataForSQL(end);
    formatDateBegin = mysql.escape(formatDateBegin);
    formatDateEnd = mysql.escape(formatDateEnd);

    //type
    let typeId = 1;
    typeId = mysql.escape(typeId);

    let query = `SELECT * FROM zaehlerstand WHERE zaehlertyp_id = ${typeId} AND datum >= ${formatDateBegin} AND datum <= ${formatDateEnd};`
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        //set data in form
        let waterVolume = 0;
        let priceSum = 0;
        let resultLength = Array.from(result).length;

        //loop through data
        Array.from(result).forEach((row) => {
            waterVolume += row.verbrauch;
            priceSum += row.preisProEinheit;
        });

        //price average
        let priceAvg = priceSum / resultLength;
        $("#priceWater").text(priceAvg);
        //volume average
        let volumeAvg = waterVolume / resultLength;
        $("#avgVolumeWater").text(volumeAvg);
        //set volume
        $("#volumeWater").text(waterVolume);
        //set useWater fee
        let fee = waterVolume * priceAvg;
        $("#feeUseWater").text(fee.toFixed(2));
    });
}

//useWater base fee
$("#useWaterBaseFee").on("change", () => {
    let val = $("#useWaterBaseFee").val();
    let feePerDay = val / 365;
    $("#avgBaseFee").text(feePerDay.toFixed(2));
    let baseFee = feePerDay * periodLength;
    $("#baseFee").text(baseFee.toFixed(2));

    //sum for use water
    let feeUseWater = parseFloat($("#feeUseWater").text());
    let netUseWater = feeUseWater + baseFee;
    $("#netUseWater").text(netUseWater.toFixed(2));
    //tax
    let tax = netUseWater * 0.07;
    $("#taxUseWater").text(tax.toFixed(2));
    //gross
    let grossUseWater = netUseWater + tax;
    $("#grossUseWater").text(grossUseWater.toFixed(2));

    //total sum
    if (waterParamsPresent()) {
        displayWaterTotal();
    }
});

//drain water
$("#priceDrainWater").on("change", () => {
    let price = parseFloat($("#priceDrainWater").val());
    let volumeUseWater = parseFloat($("#volumeWater").text());
    let feeDrainWater = price * volumeUseWater;
    $("#feeDrainWater").text(feeDrainWater.toFixed(2));

    //total sum
    if (waterParamsPresent()) {
        displayWaterTotal();
    }
});

//rain water
$("#rainWaterArea").on("change", () => {
    if (rainWaterParametersPresent()) {
        displayRainWaterFee();
    }
});
$("#rainWaterPrice").on("change", () => {
    if (rainWaterParametersPresent()) {
        displayRainWaterFee();
    }
});

function rainWaterParametersPresent() {
    let param0 = !isEmpty($("#rainWaterArea").val());
    let param1 = !isEmpty($("#rainWaterPrice").val());
    return (param0 && param1) ? true : false;
}

function displayRainWaterFee() {
    let area = parseFloat($("#rainWaterArea").val());
    let price = parseFloat($("#rainWaterPrice").val());
    let fee = area * price;
    $("#feeRainWater").text(fee.toFixed(2));

    //total sum
    if (waterParamsPresent()) {
        displayWaterTotal();
    }
}

function waterParamsPresent() {
    //if atleast one value is empty return false
    if (isEmpty($("#grossUseWater").text())) {
        return false;
    }
    if (isEmpty($("#feeDrainWater").text())) {
        return false;
    }
    if (isEmpty($("#feeRainWater").text())) {
        return false;
    }
    return true;
}

function displayWaterTotal() {
    let useWater = parseFloat($("#grossUseWater").text());
    let drainWater = parseFloat($("#feeDrainWater").text());
    let rainWater = parseFloat($("#feeRainWater").text());
    let sum = useWater + drainWater + rainWater;
    //show in form
    $("#totalFeeWater").text(sum.toFixed(2));
    //show in sidebar
    $("#waterValue").text(sum.toFixed(2));
    updateSidebarTotal();
}

/*
 * Power
 */
function pullDataForPower() {
    let begin = $("#zeitraumVon").val();
    let end = $("#zeitraumBis").val();
    let formatDateBegin = formatDataForSQL(begin);
    let formatDateEnd = formatDataForSQL(end);
    formatDateBegin = mysql.escape(formatDateBegin);
    formatDateEnd = mysql.escape(formatDateEnd);

    //type
    let typeId = 2;
    typeId = mysql.escape(typeId);

    let query = `SELECT * FROM zaehlerstand WHERE zaehlertyp_id = ${typeId} AND datum >= ${formatDateBegin} AND datum <= ${formatDateEnd};`
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        //set data in form
        let powerVolume = 0;
        let priceSum = 0;
        let resultLength = Array.from(result).length;

        //loop through data
        Array.from(result).forEach((row) => {
            powerVolume += row.verbrauch;
            priceSum += row.preisProEinheit;
        });

        //price average
        let priceAvg = priceSum / resultLength;
        $("#pricePower").text(priceAvg.toFixed(2));
        //volume average
        let volumeAvg = powerVolume / resultLength;
        $("#avgVolumePower").text(volumeAvg.toFixed(2));
        //set volume
        $("#volumePower").text(powerVolume);
        //set usepower fee
        let fee = powerVolume * priceAvg;
        $("#feeUsePower").text(fee.toFixed(2));
    });
}

//power tax
$("#taxPerPower").on("change", () => {
    let val = parseFloat($("#taxPerPower").val());
    let volume = parseFloat($("#volumePower").text());
    let fee = val * volume;
    $("#feeTaxPower").text(fee.toFixed(2));

    //total power fee
    if (powerParamsPresent()) {
        displayTotalPowerFee();
    }
});

//service flat fee
$("#serviceFlat").on("change", () => {
    let val = parseFloat($("#serviceFlat").val());
    let avg = val / 365;
    $("#avgServiceFlat").text(avg.toFixed(2));
    let fee = avg * periodLength;
    $("#feeServiceFlat").text(fee.toFixed(2));

    //total power fee
    if (powerParamsPresent()) {
        displayTotalPowerFee();
    }
});

function powerParamsPresent() {
    if (isEmpty($("#feeUsePower").text())) {
        return false;
    }
    if (isEmpty($("#feeTaxPower").text())) {
        return false;
    }
    if (isEmpty($("#feeServiceFlat").text())) {
        return false;
    }
    return true;
}

function displayTotalPowerFee() {
    let use = parseFloat($("#feeUsePower").text());
    let taxPower = parseFloat($("#feeTaxPower").text());
    let service = parseFloat($("#feeServiceFlat").text());
    let net = use + taxPower + service;
    $("#netPower").text(net.toFixed(2));
    let tax = net * 0.19;
    $("#taxPower").text(tax.toFixed(2));
    let gross = net + tax;
    $("#grossPower").text(gross.toFixed(2));
    $("#powerValue").text(gross.toFixed(2));
    updateSidebarTotal();
}

/*
 * Gas 
 */
function pullDataForGas() {
    let begin = $("#zeitraumVon").val();
    let end = $("#zeitraumBis").val();
    let formatDateBegin = formatDataForSQL(begin);
    let formatDateEnd = formatDataForSQL(end);
    formatDateBegin = mysql.escape(formatDateBegin);
    formatDateEnd = mysql.escape(formatDateEnd);

    //type
    let typeId = 3;
    typeId = mysql.escape(typeId);

    let query = `SELECT * FROM zaehlerstand WHERE zaehlertyp_id = ${typeId} AND datum >= ${formatDateBegin} AND datum <= ${formatDateEnd};`
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        //set data in form
        let gasVolume = 0;
        let priceSum = 0;
        let resultLength = Array.from(result).length;

        //loop through data
        Array.from(result).forEach((row) => {
            gasVolume += row.verbrauch;
            priceSum += row.preisProEinheit;
        });

        //price average
        let priceAvg = priceSum / resultLength;
        //convert price from cent to euro
        priceAvg /= 100;
        $("#priceGas").text(priceAvg.toFixed(2));
        //volume average
        let volumeAvg = gasVolume / periodLength;
        $("#avgVolumeGas").text(volumeAvg.toFixed(2));
        //set volume
        $("#volumeGas").text(gasVolume);
    });
}

//useGas
function useGasParamsPresent() {
    if (isEmpty($("#stateNum").val())) {
        return false;
    }
    if (isEmpty($("#burnValue").val())) {
        return false;
    }
    return true;
}

$("#stateNum").on("change", () => {
    if (useGasParamsPresent()) {
        displayUseGasFee();
    }
});
$("#burnValue").on("change", () => {
    if (useGasParamsPresent()) {
        displayUseGasFee();
    }
});

function displayUseGasFee() {
    let stateNum = parseFloat($("#stateNum").val());
    let burnValue = parseFloat($("#burnValue").val());
    let volume = parseFloat($("#volumeGas").text());
    let volume_kWh = stateNum * burnValue * volume;
    $("#calcVolumeGas").text(volume_kWh.toFixed(2));
    let price = parseFloat($("#priceGas").text());
    let fee = volume_kWh * price;
    $("#feeUseGas").text(fee.toFixed(2));

    //display total gas sum
    if (totalGasParamsPresent()) {
        displayTotalGasFee();
    }
}

//base fee
$("#baseFeeGas").on("change", () => {
    let val = $("#baseFeeGas").val();
    let feePerDay = val / 365;
    $("#avgBaseFeeGas").text(feePerDay.toFixed(2));
    let fee = feePerDay * periodLength;
    $("#feeBaseFeeGas").text(fee.toFixed(2));

    //display total gas sum
    if (totalGasParamsPresent()) {
        displayTotalGasFee();
    }
});

//gas tax
$("#taxPerGas").on("change", () => {
    if (!isEmpty($("#calcVolumeGas").text())) {
        let val = parseFloat($("#taxPerGas").val());
        let volume = parseFloat($("#calcVolumeGas").text());
        let fee = val * volume;
        $("#feeTaxGas").text(fee.toFixed(2));

        //display total gas sum
        if (totalGasParamsPresent()) {
            displayTotalGasFee();
        }
    }
});

function totalGasParamsPresent() {
    if (isEmpty($("#feeUseGas").text())) {
        return false;
    }
    if (isEmpty($("#feeBaseFeeGas").text())) {
        return false;
    }
    if (isEmpty($("#feeTaxGas").text())) {
        return false;
    }
    return true;
}

function displayTotalGasFee() {
    let useGas = parseFloat($("#feeUseGas").text());
    let base = parseFloat($("#feeBaseFeeGas").text());
    let taxFee = parseFloat($("#feeTaxGas").text());
    let net = useGas + base + taxFee;
    $("#netGas").text(net.toFixed(2));
    let tax = net * 0.19;
    $("#taxGas").text(tax.toFixed(2));
    let gross = net + tax;
    $("#grossGas").text(gross.toFixed(2));
    $("#gasValue").text(gross.toFixed(2));
    updateSidebarTotal();
}

function valuesArePresent(elementIds) {
    let tagName = $(`#${elementIds[0]}`).prop("tagName");
    /*
     * determines whether the user input of the fields are empty or not
     * when an empty field gets found the function returns false
     */
    switch (tagName.toLowerCase()) {
        case "input":
            for (let i = 0; i < elementIds.length; i++) {
                let empty = isEmpty($(`#${elementIds[i]}`).val());
                if (empty) {
                    return false;
                }
            }
            break;
        case "h6":
            for (let i = 0; i < elementIds.length; i++) {
                let empty = isEmpty($(`#${elementIds[i]}`).html());
                if (empty) {
                    return false;
                }
            }
            break;
        default:
            for (let i = 0; i < elementIds.length; i++) {
                let empty = isEmpty($(`#${elementIds[i]}`).html());
                if (empty) {
                    return false;
                }
            }
            break;
    }
    //if the function reaches this point all fields are not empty
    return true;
}

function updateSidebarTotal() {
    let water = parseFloat($("#waterValue").text());
    let power = parseFloat($("#powerValue").text());
    let gas = parseFloat($("#gasValue").text());
    let sum = water + power + gas;
    $("#rightBarSum").text(sum.toFixed(2));
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function formatDataForSQL(str) {
    let part = str.split(".");
    let formatDate = "";
    for (let i = part.length - 1; i >= 0; i--) {
        formatDate += part[i];
        if (i !== 0) {
            formatDate += "-";
        }
    }
    return formatDate;
}