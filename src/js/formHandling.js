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
    if (checkPeriod() && checkSelectedCounter()) {
        let begin = $("#zeitraumVon").val();
        let end = $("#zeitraumBis").val();
        periodLength = getDateDifference(begin, end);
        $("#periodLength").text(periodLength);

        pullDataForWater();
        pullDataForPower();
        pullDataForGas();

        //remove blur from div
        $("#finanzenMain").removeClass("blur");
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
    if (isEmpty(begin) || isEmpty(end)) {
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
    //check year
    if (beginDate.year > endDate.year) {
        M.toast({
            html: 'Konflikt: Starttag ist später oder gleich dem Endtag'
        });
        return false;
    }
    //check month
    if (beginDate.month > endDate.month && beginDate.year >= endDate.year) {
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

function checkSelectedCounter() {
    let selectWater = $("#selectCounterWater").val();
    let selectPower = $("#selectCounterPower").val();
    let selectGas = $("#selectCounterGas").val();
    let a = [selectWater, selectPower, selectGas];
    for (let i = 0; i < a.length; i++) {
        if (isEmpty(a[i])) { //element is empty
            M.toast({
                html: 'Angabe zu Zählernummer fehlt'
            });
            return false;
        }
    }
    //everything is not empty
    return true;
}

//Currently not used
function pullFormData(typeId) {
    return new Promise((resolve, reject) => {
        let begin = $("#zeitraumVon").val();
        let end = $("#zeitraumBis").val();
        let formatDateBegin = formatDateToSQL(begin);
        let formatDateEnd = formatDateToSQL(end);
        formatDateBegin = mysql.escape(formatDateBegin);
        formatDateEnd = mysql.escape(formatDateEnd);

        //counterNr filter
        let counterNr = $("#selectCounterWater").val();
        counterNr = mysql.escape(counterNr);

        let query = `SELECT zaehlernummer, DATE_FORMAT(datum, \"%d.%m.%Y\") AS format, verbrauch, preisProEinheit
                FROM zaehlerstand
                WHERE zaehlertyp_id = ${typeId} AND datum >= ${formatDateBegin} AND datum <= ${formatDateEnd}
                AND zaehlernummer = ${counterNr}
                ORDER BY datum ASC;`;

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

/*
 * Water
 */
function pullDataForWater() {
    let begin = $("#zeitraumVon").val();
    let end = $("#zeitraumBis").val();
    let formatDateBegin = formatDateToSQL(begin);
    let formatDateEnd = formatDateToSQL(end);
    formatDateBegin = mysql.escape(formatDateBegin);
    formatDateEnd = mysql.escape(formatDateEnd);

    //type
    let typeId = 1;
    typeId = mysql.escape(typeId);

    //counterNr filter
    let counterNr = $("#selectCounterWater").val();
    counterNr = mysql.escape(counterNr);

    let query = `SELECT zaehlernummer, DATE_FORMAT(datum, \"%d.%m.%Y\") AS format, verbrauch, preisProEinheit
                FROM zaehlerstand
                WHERE zaehlertyp_id = ${typeId} AND datum >= ${formatDateBegin} AND datum <= ${formatDateEnd}
                AND zaehlernummer = ${counterNr}
                ORDER BY datum ASC;`;
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        //set data in form
        let a = Array.from(result);
        let minVolume = 0;
        let maxVolume = 1;
        let priceSum = 0;
        let resultLength = a.length;
        let dataForAvg = [];

        //loop through data
        a.forEach((row, index) => {
            priceSum += row.preisProEinheit;
            if (index === 0) { //first iteration
                minVolume = row.verbrauch;
            }
            if (index === resultLength - 1) { //last iteration
                maxVolume = row.verbrauch;
            }
            //calc avg
            let item = {
                price: row.preisProEinheit,
                date: formatDateFromSQL(row.format)
            };
            dataForAvg.push(item);
        });
        //delta of min and max
        let volume = maxVolume - minVolume;
        $("#volumeWater").text(volume.toFixed(2));
        //price average
        let priceAvg = calcPriceAvg(dataForAvg);
        $("#priceWater").text(priceAvg.toFixed(2));
        //volume average
        let volumeAvg = volume / periodLength;
        $("#avgVolumeWater").text(volumeAvg.toFixed(2));
        //set volume
        $("#volumeWater").text(volume.toFixed(2));
        //set useWater fee
        let fee = volume * priceAvg;
        $("#feeUseWater").text(fee.toFixed(2));
    });
}

function calcPriceAvg(data) {
    let avg = 0;
    let diffSum = 0;
    let factors = [];
    //get date differences
    for (let i = 0; i < data.length; i++) {
        let dateDiff;
        if (i < data.length - 1) { //is not last iteration
            dateDiff = getDateDifference(data[i].date, data[i + 1].date);
        } else {
            let periodEnd = $("#zeitraumBis").val();
            dateDiff = getDateDifference(data[i].date, periodEnd);
        }
        diffSum += dateDiff;
        //push date difference
        factors.push(dateDiff);
    }
    //calc relative difference of factors to diffSum
    for (let i = 0; i < factors.length; i++) {
        factors[i] = factors[i] / diffSum;
    }
    for (let i = 0; i < data.length; i++) {
        avg += data[i].price * factors[i];
    }
    return avg;
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
    let formatDateBegin = formatDateToSQL(begin);
    let formatDateEnd = formatDateToSQL(end);
    formatDateBegin = mysql.escape(formatDateBegin);
    formatDateEnd = mysql.escape(formatDateEnd);

    //type
    let typeId = 2;
    typeId = mysql.escape(typeId);

    //counterNr filter
    let counterNr = $("#selectCounterPower").val();
    counterNr = mysql.escape(counterNr);

    let query = `SELECT zaehlernummer, DATE_FORMAT(datum, \"%d.%m.%Y\") AS format, verbrauch, preisProEinheit
                FROM zaehlerstand
                WHERE zaehlertyp_id = ${typeId} AND datum >= ${formatDateBegin} AND datum <= ${formatDateEnd}
                AND zaehlernummer = ${counterNr}
                ORDER BY datum ASC;`;
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        //set data in form
        let a = Array.from(result);
        let minVolume;
        let maxVolume;
        let priceSum = 0;
        let resultLength = a.length;
        let dataForAvg = [];

        //loop through data
        a.forEach((row, index) => {
            priceSum += row.preisProEinheit;
            if (index === 0) { //first iteration
                minVolume = row.verbrauch;
                return;
            }
            if (index === resultLength - 1) { //last iteration
                maxVolume = row.verbrauch;
            }
            //calc avg
            let item = {
                price: row.preisProEinheit,
                date: formatDateFromSQL(row.format)
            };
            dataForAvg.push(item);
        });
        //delta of min and max
        let volume = maxVolume - minVolume;
        $("#volumePower").text(volume.toFixed(2));


        //price average
        let priceAvg = calcPriceAvg(dataForAvg);
        priceAvg /= 100; //convert from cent to euro
        $("#pricePower").text(priceAvg.toFixed(2));
        //volume average
        let volumeAvg = volume / periodLength;
        $("#avgVolumePower").text(volumeAvg.toFixed(2));
        //set volume
        $("#volumePower").text(volume);
        //set usepower fee
        let fee = volume * priceAvg;
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
    let formatDateBegin = formatDateToSQL(begin);
    let formatDateEnd = formatDateToSQL(end);
    formatDateBegin = mysql.escape(formatDateBegin);
    formatDateEnd = mysql.escape(formatDateEnd);

    //type
    let typeId = 3;
    typeId = mysql.escape(typeId);

    //counterNr filter
    let counterNr = $("#selectCounterGas").val();
    counterNr = mysql.escape(counterNr);

    //select everything from table in date range and order by ascending date
    let query = `SELECT zaehlernummer, DATE_FORMAT(datum, \"%d.%m.%Y\") AS format, verbrauch, preisProEinheit
                FROM zaehlerstand
                WHERE zaehlertyp_id = ${typeId} AND datum >= ${formatDateBegin} AND datum <= ${formatDateEnd}
                AND zaehlernummer = ${counterNr}
                ORDER BY datum ASC;`;
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        //set data in form
        let a = Array.from(result);

        let minVolume;
        let maxVolume;
        let priceSum = 0;
        let resultLength = a.length;
        let dataForAvg = [];

        //loop through data
        a.forEach((row, index) => {
            priceSum += row.preisProEinheit;
            if (index === 0) { //first iteration
                minVolume = row.verbrauch;
                return;
            }
            if (index === resultLength - 1) { //last iteration
                maxVolume = row.verbrauch;
            }
            //calc avg
            let item = {
                price: row.preisProEinheit,
                date: formatDateFromSQL(row.format)
            };
            dataForAvg.push(item);
        });
        //delta of min and max
        let volume = maxVolume - minVolume;
        $("#volumeGas").text(volume.toFixed(2));

        //price average
        let priceAvg = calcPriceAvg(dataForAvg);
        //convert price from cent to euro
        priceAvg /= 100;
        $("#priceGas").text(priceAvg.toFixed(2));
        //volume average
        let volumeAvg = volume / periodLength;
        $("#avgVolumeGas").text(volumeAvg.toFixed(2));
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

//clear all inputs in finanzstatus
$("#resetForm").on("click", () => {
    let inputs = document.querySelector("#finanzen").getElementsByTagName("input");
    Array.from(inputs).forEach((element) => {
        element.value = "";
    });

    let gebühren = document.querySelector("#finanzen").querySelectorAll(".gebühr");
    Array.from(gebühren).forEach((element) => {
        element.innerHTML = "";
    });

    let selects = document.querySelector("#finanzen").querySelectorAll("select");
    Array.from(selects).forEach((element) => {
        element.value = "";
    });

    $("#periodLength").text(""); //empty period length

    let sidebarValues = document.querySelectorAll(".tableValue");
    Array.from(sidebarValues).forEach((element) => {
        element.innerHTML = "0";
    });
    $("#rightBarSum").text("0");

    //collapse all divs
    $("#closeAllCollapsibleFinance").click();

    //blur out main
    document.getElementById("finanzenMain").classList.add("blur");
});