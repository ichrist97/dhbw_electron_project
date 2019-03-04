// Jquery setup
window.$ = window.jQuery = require('jquery');

const mysql = require('mysql');

// Add the credentials to access your database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'nebenkosten'
});

$(document).ready(() => {
    loadExistingData();
    initCounterSelect();
});

function loadExistingData() {
    let selectArgs = ["zaehlerstand.id", "zaehlertyp.name", "zaehlernummer", "DATE_FORMAT(datum, \"%e.%m.%Y\") AS datum", "verbrauch", "preisProEinheit"];
    let fromArgs = ["zaehlerstand, zaehlertyp"];
    let whereArgs = ["zaehlertyp_id = zaehlertyp.id"];

    let query = `SELECT ${selectArgs.join()} FROM ${fromArgs.join()} WHERE ${whereArgs}`;
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
            let datum = row.datum;
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

            //add delete btn to row
            createDelBtn(tbody);
            //add edit btn to row
            createEditBtn(tbody, type);
        });
        //update sidebar
        $("#countWater").text(waterCtr);
        $("#countPower").text(powerCtr);
        $("#countGas").text(gasCtr);
    });
}

$("#btnAddEntry").on("click", () => {
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
    let formattedDate = formatDate(datum);
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

    M.toast({
        html: 'Zählerstand eingetragen'
    });

    function formatDate(date) {
        let part = date.split(".");
        let formattedDate = "";
        for (let i = part.length - 1; i >= 0; i--) {
            formattedDate += part[i];
            if (i !== 0) {
                formattedDate += "-";
            }
        }
        return formattedDate;
    }
});

function createEditBtn(tbody, type) {
    let btn = document.createElement("a");
    btn.className = "btn waves-effect waves-light btn-editEntry modal-trigger";
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
    let formatDate = mysql.escape(formatDataForSQL(date));
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
    M.toast({
        html: 'Zählerstand verändert'
    });
});

function createDelBtn(tbody) {
    let btn = document.createElement("a");
    btn.className = "btn waves-effect waves-light modal-trigger";
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
    M.toast({
        html: 'Zählerstand gelöscht'
    });
});

function initCounterSelect() {
    let query = `SELECT DISTINCT zaehlernummer, zaehlertyp_id
                FROM zaehlerstand
                GROUP BY zaehlertyp_id;`;
    //console.log(query);
    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        let a = Array.from(result);
        a.forEach((row) => {
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
    });
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

function refreshTable() {
    let tbodies = document.querySelector("#tableContainer").querySelectorAll("tbody");
    Array.from(tbodies).forEach((element) => {
        element.innerHTML = "";
    });
    loadExistingData();
}