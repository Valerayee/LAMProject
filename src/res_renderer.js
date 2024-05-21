function getPrimerSeq(set, i) {
    const primer = set["primers"][i];
    if (primer["type"] == "base") {
        const seq = primer["base_seq"];
        return [seq, "<mark style=\"background-color: pink\">" + seq + "</mark>"];
    } else {
        const seq = primer["comp_seq"];
        return [seq, "<mark style=\"background-color: lightblue\">" + seq + "</mark>"];
    }
}

function get_amplicon(set) {

    var [_, str] = getPrimerSeq(set, 0);

    for (let i = 0; i < set["primers_amount"] - 1; i++) {
        const dist = set["distances"][i]["base_seq"];
        const [_, seq] = getPrimerSeq(set, i + 1);
        str += dist + seq;
    }

    return str;
}


window.bridge.getData((_, data) => {

    /* const set = data["sets"][0];
    set["INDEX"] = 1;

    window.api.openSet(set);
    window.close(); */
    
    document.getElementById("primer_search_text").innerText = "Primer search time: " + data["PRIMER_SEARCH_TIME"] + " s";
    document.getElementById("primer_sort_text").innerText = "Primer sort time: " + data["PRIMER_SORT_TIME"] + " s";
    document.getElementById("time_taken_text").innerText = "Time taken: " + data["TIME_TAKEN"] + " s";
    document.getElementById("sets_found_text").innerText = "Sets found: " + data["sets_found"];
    document.getElementById("base_primers_text").innerText = "Base primers found: " + data["base_primers_found"];
    document.getElementById("comp_primers_text").innerText = "Comp primers found: " + data["comp_primers_found"];

    const sets = data["sets"];
    const sets_div = document.getElementById("sets");

    for (let i = 0; i < data["sets_found"]; i++) {

        var item_div = document.createElement("div");
        item_div.classList.add("item_div");

        var data_div = document.createElement("div");
        data_div.innerText = "#" + (i + 1) + " " + (sets[i]["start"] + 1) + "-" + (sets[i]["end"] + 1);
        item_div.appendChild(data_div);

        var ampl_div = document.createElement("div");
        ampl_div.style = "cursor: pointer";
        ampl_div.innerHTML = get_amplicon(sets[i]);
        ampl_div.addEventListener("click", (e) => {
            const set = sets[i];
            set["INDEX"] = i + 1;
            window.api.openSet(set);
        });
        item_div.appendChild(ampl_div);

        sets_div.appendChild(item_div);
        
    }

});