// Jquery setup
window.$ = window.jQuery = require('jquery');

const mysql = require('mysql');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let csvWriter;

// Add the credentials to access your database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'nebenkosten'
});

$(document).ready(() => {
    loadExistingData();
    loadCounterSelect();
});

function initCsvWriter(path) {
    csvWriter = createCsvWriter({
        path: `${path}\\export.csv`,
        header: [{
            id: "counterNr",
            title: "zaehlernummer"
        }, {
            id: "date",
            title: "datum"
        }, {
            id: "amount",
            title: "verbrauch"
        }, {
            id: "pricePerUnit",
            title: "preisProEinheit"
        }, {
            id: "counterType",
            title: "zaehlertyp"
        }]
    });
}

function loadExistingData() {
    let selectArgs = ["zaehlerstand.id", "zaehlertyp.name", "zaehlernummer", "DATE_FORMAT(datum,\"%e.%m.%Y\") AS formatDate", "verbrauch", "preisProEinheit"];
    let fromArgs = ["zaehlerstand, zaehlertyp"];

    let query = `SELECT ${selectArgs.join()}
                FROM ${fromArgs.join()}
                WHERE zaehlertyp_id = zaehlertyp.id
                ORDER BY datum DESC`;
    //console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        let waterCtr = 0;
        let powerCtr = 0;
        let gasCtr = 0;

        Array.from(result).forEach((row) => {
            //load into table
            let id = row.id;
            let type = row.name;
            let zählernummer = row.zaehlernummer;
            let datum = row.formatDate;
            let verbrauch = String(row.verbrauch).replace(".", ",");
            let preisProEinheit = String(row.preisProEinheit).replace(".", ",");
            let entry = `<tr><td class="entryId" style="display:none">${id}</td><td>${zählernummer}</td><td>${datum}</td><td>${verbrauch}</td><td>${preisProEinheit}</td><td></td></tr>`;

            let tbody;
            switch (type) {
                case "Wasser":
                    $("#tbodyWasser").append(entry);
                    tbody = document.getElementById("tbodyWasser");
                    waterCtr++;
                    break;
                case "Gas":
                    $("#tbodyGas").append(entry);
                    tbody = document.getElementById("tbodyGas");
                    gasCtr++;
                    break;
                case "Strom":
                    $("#tbodyStrom").append(entry);
                    tbody = document.getElementById("tbodyStrom");
                    powerCtr++;
                    break;
                default:
                    console.log("Unknown zählertyp");
                    break;
            }
            //add edit btn to row
            createEditBtn(tbody, type);
            //add delete btn to row
            createDelBtn(tbody);
        });
        //update sidebar
        $("#countWater").text(waterCtr);
        $("#countPower").text(powerCtr);
        $("#countGas").text(gasCtr);
    });
}

$("#btnAddEntry").on("click", () => {
    if (validateAddEntryForm()) {
        //get data from modal
        let type = $("#type").val();
        //convert type string to foreign key id in database
        let foreignKey;
        if (type === "Wasser") {
            foreignKey = "1";
        } else if (type === "Strom") {
            foreignKey = "2";
        } else if (type === "Gas") {
            foreignKey = "3";
        }
        let zählernr = $("#zählernummer").val();
        let datum = $("#datum").val();
        let formattedDate = formatDateToSQL(datum);
        let verbrauch = $("#verbrauch").val();
        let preisProEinheit = $("#preisProEinheit").val();

        //sql query
        // let tableName = mysql.escape("zaehlerstand");
        let param = ["zaehlernummer", "datum", "verbrauch", "zaehlertyp_id", "preisProEinheit"];
        //escape inputs
        values = [zählernr, formattedDate, verbrauch, foreignKey, preisProEinheit];
        for (let i = 0; i < values.length; i++) {
            values[i] = mysql.escape(values[i]);
        }

        let query = `INSERT INTO zaehlerstand (${param.join()}) VALUES (${values.join()})`;
        //console.log(query);

        connection.query(query, values, (err, result) => {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                return;
            }
            console.log("Succesfully inserted into database");
        });
        refreshTable();

        //refresh chart
        let chartParam = getChartParams(type);
        loadChart(chartParam);

        //update selects in finance for counterNr
        loadCounterSelect();

        //close modal
        let elemModal = document.querySelector("#modalAddEntry");
        let instanceAddModal = M.Modal.getInstance(elemModal);
        instanceAddModal.close();

        M.toast({
            html: 'Zählerstand eingetragen'
        });
    }
});

//check if a value is given for every input; if not then tell the user via toast
function validateAddEntryForm() {
    //type is empty
    if (isEmpty($("#type").val())) {
        M.toast({
            html: 'Keinen Typ ausgewählt'
        });
        return false;
    }
    //counterNr is empty
    if (isEmpty($("#zählernummer").val())) {
        M.toast({
            html: 'Keine Zählernummer angegeben'
        });
        return false;
    }
    //date is empty
    if (isEmpty($("#datum").val())) {
        M.toast({
            html: 'Kein Datum angegeben'
        });
        return false;
    }
    //usage amount is empty, negative or zero
    let amount = $("#verbrauch").val();
    if (isEmpty(amount) || amount <= 0) {
        M.toast({
            html: 'Kein gültiger Verbrauch angegeben'
        });
        return false;
    }
    //pricePerUnit is empty, negative or zero
    let price = $("#preisProEinheit").val();
    if (isEmpty(price) || price <= 0) {
        M.toast({
            html: 'Kein gültiger Preis pro Einheit angegeben'
        });
        return false;
    }
    //everything is valid
    return true;
}

//check if a value is given for every input; if not then tell the user via toast
function validateEditEntryForm() {
    //type is empty
    if (isEmpty($("#newType").val())) {
        M.toast({
            html: 'Keinen Typ ausgewählt'
        });
        return false;
    }
    //counterNr is empty
    if (isEmpty($("#newZählernummer").val())) {
        M.toast({
            html: 'Keine Zählernummer angegeben'
        });
        return false;
    }
    //date is empty
    if (isEmpty($("#newDatum").val())) {
        M.toast({
            html: 'Kein Datum angegeben'
        });
        return false;
    }
    //usage amount is empty, negative or zero
    let amount = $("#newVerbrauch").val();
    if (isEmpty(amount) || amount <= 0) {
        M.toast({
            html: 'Kein gültiger Verbrauch angegeben'
        });
        return false;
    }
    //pricePerUnit is empty, negative or zero
    let price = $("#newPreisProEinheit").val();
    if (isEmpty(price) || price <= 0) {
        M.toast({
            html: 'Kein gültiger Preis pro Einheit angegeben'
        });
        return false;
    }
    //everything is valid
    return true;
}

function getChartParams(type) {
    let chartId;
    switch (type) {
        case "Wasser":
            chartId = "waterChart";
            break;
        case "Strom":
            chartId = "powerChart";
            break;
        case "Gas":
            chartId = "gasChart";
            break;
    }
    return chartId;
}

function createEditBtn(tbody, type) {
    let btn = document.createElement("a");
    btn.className = "btn-small waves-effect waves-light modal-trigger btn-acc";
    btn.setAttribute("href", "#modalEditEntry");
    let icon = document.createElement("i");
    icon.className = "large material-icons";
    icon.innerText = "mode_edit";
    btn.appendChild(icon);
    let rows = tbody.getElementsByTagName("tr");
    let td = rows[rows.length - 1].childNodes;
    td[td.length - 1].appendChild(btn);

    //event listener for opening the edit modal
    btn.addEventListener("click", (event) => {
        //load data into modalEditEntry
        let tr = event.currentTarget.parentElement.parentElement;
        let id = tr.childNodes[0].innerText;
        $("#editIdHolder").text(id);
        $("#newType").val(type);
        //reset materialize select
        let selectElem = document.querySelector("#newType");
        M.FormSelect.init(selectElem, {});
        $("#newZählernummer").val(td[1].innerText);
        $("#newDatum").val(td[2].innerText);
        $("#newVerbrauch").val(td[3].innerText);
        let price = td[4].innerText;
        price = price.replace(",", ".");
        $("#newPreisProEinheit").val(price);
    });
}

//edit entry in modal
$("#btnEditEntry").on("click", (event) => {
    if (validateEditEntryForm()) {
        //pull data
        let id = $("#editIdHolder").text();
        id = mysql.escape(id);
        let type = $("#newType").val();
        let typeId;
        if (type === "Wasser") {
            typeId = 1;
        } else if (type === "Strom") {
            typeId = 2;
        } else if (type === "Gas") {
            typeId = 3;
        }
        typeId = mysql.escape(typeId);

        let counterNr = mysql.escape($("#newZählernummer").val());
        let date = $("#newDatum").val();
        let formatDate = mysql.escape(formatDateToSQL(date));
        let amount = mysql.escape($("#newVerbrauch").val());
        let price = $("#newPreisProEinheit").val();
        price = price.replace(",", ".");
        price = mysql.escape(price);

        //query
        let query = `UPDATE zaehlerstand
                SET zaehlernummer = ${counterNr}, datum = ${formatDate}, verbrauch = ${amount}, preisProEinheit = ${price},
                zaehlertyp_id = ${typeId}
                WHERE id = ${id};`;
        console.log(query);
        connection.query(query, (err, result) => {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                return;
            }
            console.log("Updated entry in database");
        });

        refreshTable();
        loadCounterSelect();

        //close modal
        let elemModal = document.querySelector("#modalEditEntry");
        let instanceAddModal = M.Modal.getInstance(elemModal);
        instanceAddModal.close();

        M.toast({
            html: 'Zählerstand verändert'
        });
    }
});

function createDelBtn(tbody) {
    let btn = document.createElement("a");
    btn.className = "btn-small red waves-effect waves-light modal-trigger btn-acc";
    btn.setAttribute("href", "#modalDelEntry");
    let icon = document.createElement("i");
    icon.className = "large material-icons";
    icon.innerText = "delete";
    btn.appendChild(icon);
    let rows = tbody.getElementsByTagName("tr");
    let td = rows[rows.length - 1].childNodes;
    td[td.length - 1].appendChild(btn);

    btn.addEventListener("click", (event) => {
        let tr = event.currentTarget.parentElement.parentElement;
        let id = tr.childNodes[0].innerText;
        $("#delIdHolder").text(id);
        let type;
        if (tr.parentElement.id === "tbodyWasser") {
            type = "Wasser";
        } else if (tr.parentElement.id === "tbodyStrom") {
            type = "Strom";
        } else if (tr.parentElement.id === "tbodyGas") {
            type = "Gas";
        }
        $("#delTypeHolder").text(type);
    });
}

$("#deleteEntry").on("click", () => {
    let id = $("#delIdHolder").text();
    id = mysql.escape(id);
    let query = `DELETE FROM zaehlerstand WHERE id = ${id}`;
    console.log(query);
    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        console.log("Deleted entry in database");
    });

    refreshTable();
    loadCounterSelect();

    //refresh chart
    let chartParam = getChartParams($("#delTypeHolder").text());
    loadChart(chartParam);

    M.toast({
        html: 'Zählerstand gelöscht'
    });
});

function getCounterNums() {
    return new Promise((resolve, reject) => {
        let query = `SELECT DISTINCT zaehlernummer, zaehlertyp_id
                    FROM zaehlerstand;`;

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

function loadCounterSelect() {
    //empty the selects
    let selects = ["selectCounterWater", "selectCounterPower", "selectCounterGas"];
    for (let i = 0; i < selects.length; i++) {
        document.getElementById(selects[i]).innerHTML = `<option value="" disabled selected>Wähle deine Option</option>`;
        M.FormSelect.init(selects[i], {});
    }

    getCounterNums().then((rows) => {
        Array.from(rows).forEach((row) => {
            if (row.zaehlertyp_id == 1) { //water
                $("#selectCounterWater").append($(`<option value="${row.zaehlernummer}">${row.zaehlernummer}</option>`));
                //update materialize select
                let selectElem = document.querySelectorAll("#selectCounterWater");
                M.FormSelect.init(selectElem, {});
            } else if (row.zaehlertyp_id == 2) { //power
                $("#selectCounterPower").append($(`<option value="${row.zaehlernummer}">${row.zaehlernummer}</option>`));
                //update materialize select
                let selectElem = document.querySelectorAll("#selectCounterPower");
                M.FormSelect.init(selectElem, {});
            } else if (row.zaehlertyp_id == 3) { //gas
                $("#selectCounterGas").append($(`<option value="${row.zaehlernummer}">${row.zaehlernummer}</option>`));
                //update materialize select
                let selectElem = document.querySelectorAll("#selectCounterGas");
                M.FormSelect.init(selectElem, {});
            }
        });
    }).catch((err) => setImmediate(() => {
        throw err;
    })); // Throw async to escape the promise chain
}

function formatDateToSQL(str) {
    let part = str.toString().split(".");
    let formatDate = "";
    for (let i = part.length - 1; i >= 0; i--) {
        formatDate += part[i];
        if (i !== 0) {
            formatDate += "-";
        }
    }
    return formatDate;
}

function formatDateFromSQL(str) {
    let part = str.toString().split("-");
    let formatDate = "";
    for (let i = part.length - 1; i >= 0; i--) {
        formatDate += part[i];
        if (i !== 0) {
            formatDate += ".";
        }
    }
    return formatDate;
}

function refreshTable() {
    let tbodies = document.querySelector("#tableContainer").querySelectorAll("tbody");
    Array.from(tbodies).forEach((element) => {
        element.innerHTML = "";
    });
    loadExistingData();
}

$("#createCSV").on("click", () => {
    $("#chooseDir").click();
    $("#chooseDir").on("change", () => {
        let path = document.getElementById("chooseDir").files[0].path;
        if (path != null) {
            initCsvWriter(path);
            exportCSV();
        }
    });
});

function exportCSV() {
    let data = [];
    let query = `SELECT stand.zaehlernummer, DATE_FORMAT(stand.datum,\"%e.%m.%Y\") AS formatDate, stand.verbrauch, stand.preisProEinheit, typ.name
                FROM zaehlerstand stand, zaehlertyp typ
                WHERE stand.zaehlertyp_id = typ.id;`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        Array.from(result).forEach((row) => {
            let item = {
                counterNr: row.zaehlernummer,
                date: row.formatDate,
                amount: row.verbrauch,
                pricePerUnit: row.preisProEinheit,
                counterType: row.name
            };
            data.push(item);
        });

        //write csv
        csvWriter.writeRecords(data).then(() => {
            console.log("Created csv-file.");
        });
    });

}