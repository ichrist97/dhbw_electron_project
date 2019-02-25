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

//brauchwasser calculation
$("#preisBrauchwasser").on("change", () => {
    let waterVolume = 0; //missing select statement
    let days = 200; //missing select statement

    //calc statistics
    $("#tageSeit").val(days);
    $("#tageBis").val(365 - days);
    $("#avgVerbrauch").val(waterVolume / days);

    //calc final price
    let price = $("#preisBrauchwasser").val();
    $("#brauchwasserGebühr").text(waterVolume * price);

    //set presence in map
    valuePresence.set("brauchwasserGebühr", true);

    //display brauchwasser sum if both requisites are present
    if ((valuePresence.get("brauchwasserGebühr")) && (valuePresence.get("wasserGrundgebühr"))) {
        displayBrauchwasserSum();
    }

    //display total sum if all gebühren are present

});

$("#wasserGrundgebühr").on("change", () => {
    let value = $("#wasserGrundgebühr").val();

    //calc average
    let avg = value / 365;
    $("#grundgebührTag").val(avg.toFixed(2));

    //set presence in map
    valuePresence.set("wasserGrundgebühr", true);

    //display brauchwasser sum if both requisites are present
    if ((valuePresence.get("brauchwasserGebühr")) && (valuePresence.get("wasserGrundgebühr"))) {
        displayBrauchwasserSum();
    }
});

function displayBrauchwasserSum() {
    //netto
    let brauchwasser = $("#brauchwasserGebühr").val();
    let grundgebühr = $("#wasserGrundgebühr").val();
    let sum = brauchwasser + grundgebühr;
    $("#nettoBrauchwasser").val(sum)
    //ust 7%
    let ust = sum * 0.07;
    $("#ustBrauchwasser").val(ust);
    //brutto
    let brutto = sum + ust;
    $("#bruttoBrauchwasser").html(brutto.toFixed(2));

    //total water gebühr
    if (areWaterGebührenPresent()) {
        displayTotalWaterSum();
    }
}

$("#preisAbwasser").on("change", () => {
    let price = $("#preisAbwasser").val();
    let volume = $("#brauchwasservolumen").val();
    let erg = price * volume;
    $("#abwasserGebühr").html(erg.toFixed(2));
    valuePresence.set("abwasserGebühr", true);
});

$("#niederschlagfläche").on("change", () => {
    if ($("#niederschlagfläche").val() && $("#flächenpreis").val()) {
        displayNiederschlag();
    }
});

$("#flächenpreis").on("change", () => {
    if ($("#niederschlagfläche").val() && $("#flächenpreis").val()) {
        displayNiederschlag();
    }
});

function displayNiederschlag() {
    let area = $("#niederschlagfläche").val();
    let price = $("#flächenpreis").val();
    let erg = area * price;
    $("#niederschlagGebühr").html(erg.toFixed(2));
    valuePresence.set("niederschlagGebühr", true);

    //total water gebühr
    if (areWaterGebührenPresent()) {
        displayTotalWaterSum();
    }
}

function displayTotalWaterSum() {
    let brauchwasser = parseFloat($("#bruttoBrauchwasser").html());
    let abwasser = parseFloat($("#abwasserGebühr").html());
    let niederschlag = parseFloat($("#niederschlagGebühr").html());
    let sum = brauchwasser + abwasser + niederschlag;
    $("#gesamtWasser").html(sum.toFixed(2));
}

//buggy
function areWaterGebührenPresent() {
    let b0 = !isEmpty($("#bruttoBrauchwasser").html());
    let b1 = !isEmpty($("#abwasserGebühr").html());
    let b2 = !isEmpty($("#niederschlagGebühr").html());

    //returns true when all values in array are true
    let a = [b0, b1, b2];
    if (a.every((currentValue, index, arr) => {
            return currentValue === arr[0] && currentValue !== null;
        })) {
        return true;
    }
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

/*
 * Strom
 */

$("#preisStrom").on("change", () => {
    let price = $("#preisStrom").val();
    let volume = $("#stromVerbrauch").val();
    let erg = price * volume;
    $("#stromverbrauchGebühr").html(erg.toFixed(2));

    //strom total sum
    if (stromGebührenPresent()) {
        displayStromSum();
    }
});

$("#stromsteuer").on("change", () => {
    let tax = $("#stromsteuer").val();
    let volume = $("#stromVerbrauch").val();
    let erg = tax * volume;
    $("#stromsteuerGebühr").html(erg.toFixed(2));

    //strom total sum
    if (stromGebührenPresent()) {
        displayStromSum();
    }
});

$("#servicepauschale").on("change", () => {
    $("#servicepauschaleGebühr").html($("#servicepauschale").val());

    //strom total sum
    if (stromGebührenPresent()) {
        displayStromSum();
    }
});

function stromGebührenPresent() {
    let a = [];
    a[0] = !isEmpty($("#stromverbrauchGebühr").html());
    a[1] = !isEmpty($("#stromsteuerGebühr").html());
    a[2] = !isEmpty($("#servicepauschaleGebühr").html());
    //when all values from array are true then return true
    if (a.every((curValue, index, arr) => {
            return (curValue === a[0] && curValue !== null);
        })) {
        return true;
    }
}

function displayStromSum() {
    let verbrauchGebühr = parseFloat($("#stromverbrauchGebühr").html());
    let steuerGebühr = parseFloat($("#stromsteuerGebühr").html());
    let pauschale = parseFloat($("#servicepauschaleGebühr").html());
    let nettoSum = verbrauchGebühr + steuerGebühr + pauschale;
    $("#nettoStrom").val(nettoSum);
    let ust = nettoSum * 0.19;
    $("#ustStrom").val(ust);
    let bruttoSum = nettoSum + ust;
    $("#bruttoStrom").html(bruttoSum.toFixed(2));
}

/*
 * Gas 
 */
//arbeitspreis
let arbeitspreisIds = ["zustandszahl", "brennwert", "preisGas"];
let gasGebührenIds = [];
Array.from(document.querySelector("#gasFinanzen").getElementsByClassName("gebühr")).forEach((element) => {
    gasGebührenIds.push(element.id);
});

//add listener for each input field to trigger the total sum of arbeitspreis
arbeitspreisIds.forEach((id) => {
    $(`#${id}`).on("change", () => {
        if (valuesArePresent(arbeitspreisIds)) {
            displayArbeitspreis();
        }
    });
});

function displayArbeitspreis() {
    let gasverbrauch = parseFloat($("#gasverbrauch").val()); //missing select
    gasverbrauch = 1; //dummy
    let zustandszahl = parseFloat($("#zustandszahl").val());
    let brennwert = parseFloat($("#brennwert").val());
    let preisGas = parseFloat($("#preisGas").val());
    let energieVolumen = zustandszahl * brennwert * gasverbrauch;
    $("#energievolumen").val(energieVolumen);
    let arbeitspreis = energieVolumen * preisGas;
    $("#arbeitspreisGebühr").html(arbeitspreis.toFixed(2));
}

//grundpreis
$("#grundpreisJahr").on("change", () => {
    $("#grundpreisGebühr").html($("#grundpreisJahr").val());
});

//erdgassteuer
$("#erdgassteuer").on("change", () => {
    let steuer = parseFloat($("#erdgassteuer").val());
    let verbrauch = parseFloat($("#energievolumen").val());
    let erg = steuer * verbrauch;
    $("#erdgassteuerGebühr").html(erg.toFixed(2));

    //display total sum of gas
    if (valuesArePresent(gasGebührenIds)) {
        displayTotalGasSum(gasGebührenIds);
    }
});

function displayTotalGasSum(gasGebührenIds) {
    let netto = 0;
    gasGebührenIds.forEach((id) => {
        netto += parseFloat($(`#${id}`).html());
    });
    console.log(netto);
    $("#nettoGas").val(netto.toFixed(2));
    let ust = netto * 0.19;
    $("#ustGas").val(ust.toFixed(2));
    let brutto = netto + ust;
    $("#bruttoGas").html(brutto.toFixed(2));
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