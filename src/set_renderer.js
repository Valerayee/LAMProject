function getPrimerSeq(primer) {
    if (primer["type"] == "base") {
        const seq = primer["base_seq"];
        return [seq, "<mark style=\"background-color: pink\">" + seq + "</mark>"];
    } else {
        const seq = primer["comp_seq"];
        return [seq, "<mark style=\"background-color: lightblue\">" + seq + "</mark>"];
    }
}

function checkIfMark(primer, type) {
    const [seq, mark] = getPrimerSeq(primer);
    if (primer["type"] == type) {
        return mark;
    } else {
        return seq;
    }
}

function getDist(set, i, type) {
    if (type == "base") {
        return set["distances"][i]["base_seq"];
    } else {
        return set["distances"][i]["comp_seq"];
    }
}

function getSequence(set, type) {

    var str = checkIfMark(set["primers"][0], type);

    for (let i = 0; i < set["primers_amount"] - 1; i++) {
        const dist = getDist(set, i, type);
        const seq = checkIfMark(set["primers"][i + 1], type);
        str += dist + seq;
    }

    return str;

}

function formPrimers(set) {

    var str = "";
    
    for (let i = 0; i < set["primers_amount"]; i++) {
        const [seq, _] = getPrimerSeq(set["primers"][i]);
        str += seq + " ";
    }

    return str;
}

function getMinMax(set, field) {
    const value = set["primers"][0][field];
    var [min, max] = [value, value];

    for (let i = 1; i < set["primers_amount"]; i++) {
        const value = set["primers"][i][field];
        if (value > max) {
            max = value;
        } else if (value < min) {
            min = value;
        }
    }

    return [min, max];
}

window.bridge.getData((_, data) => {

    document.getElementById("index_text").innerText = "Set index: " + data["INDEX"];
    
    document.getElementById("start_text").innerText = "Set start: " + data["start"] + 1;
    document.getElementById("end_text").innerText = "Set end: " + data["end"] + 1;
    document.getElementById("amplicon_text").innerText = "Amplicon length: " + data["length"];

    //[document.getElementById("GC_MIN_text").innerHTML, document.getElementById("GC_MAX_text").innerHTML] = getMinMax(data, "GC");
    //[document.getElementById("TM_MIN_text").innerHTML, document.getElementById("TM_MAX_text").innerHTML] = getMinMax(data, "Tm");

    document.getElementById("base_sequence_text").innerHTML = getSequence(data, "base");
    document.getElementById("complementary_sequence_text", ).innerHTML = getSequence(data, "comp");

    const copy_btn = document.getElementById("copy_button");
    copy_btn.addEventListener("click", (e) => {
        window.api.copyToClipboard(formPrimers(data));
    });

    const primer_indexes = ["F3", "F2", "F1c", "B1c", "B2", "B3"];

    for (let i = 0; i < data["primers_amount"]; i++) {
        const primer = data["primers"][i];
        const [_, seq] = getPrimerSeq(primer);
        document.getElementById(primer_indexes[i] + "_seq_text").innerHTML = seq;
        document.getElementById(primer_indexes[i] + "_start_text").innerHTML = primer["start"] + 1;
        document.getElementById(primer_indexes[i] + "_end_text").innerHTML = primer["end"] + 1;
        document.getElementById(primer_indexes[i] + "_length_text").innerHTML = primer["length"];
        document.getElementById(primer_indexes[i] + "_GC_text").innerHTML = primer["GC"];
        document.getElementById(primer_indexes[i] + "_Tm_text").innerHTML = primer["Tm"];
    }

});