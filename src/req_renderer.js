const parameter_zone = document.getElementById("parameter_zone");
  
var genome;
var display_full = false;

function openParameters() {

    window.api.resizeWindow(850, 750);

    parameter_zone.style = "grid-column: 1 / 5; grid-row: 2 / 8;";

    display_full = true;

}

function setMinMax(element, min, max, value) {

    element.min = min;
    element.max = max;
    element.value = value;
  
}

function getParsed(currentFrom, currentTo) {
    const from = parseInt(currentFrom.value, 10);
    const to = parseInt(currentTo.value, 10);
    return [from, to];
}

const genome_title = document.getElementById("genome_title");

function updateGenomeTitle() {

    const [from, to] = getParsed(fromInput, toInput);
    const length = to + 1 - from;
    const str = length;

    genome_title.innerText = "Sequence length: " + str;

}

const fromSlider = document.getElementById("genome_from_slider");
const toSlider = document.getElementById("genome_to_slider");
const fromInput = document.getElementById("genome_from_input");
const toInput = document.getElementById("genome_to_input");

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max-to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
      ${rangeColor} ${((fromPosition)/(rangeDistance))*100}%,
      ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
      ${sliderColor} 100%)`;
}

function updateGenomeRange(length) {

    setMinMax(fromSlider, 1, length, 1);
    setMinMax(toSlider, 1, length, length);
    fromInput.value = 1;
    toInput.value = length;

    updateGenomeTitle();
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);

}

function setToggleAccessible(currentTarget) {
    const toSlider = document.getElementById("genome_to_slider");
    if (Number(currentTarget.value) <= 0 ) {
      toSlider.style.zIndex = 2;
    } else {
      toSlider.style.zIndex = 0;
    }
}

setToggleAccessible(toSlider);

function controlFromSlider(fromSlider, toSlider, fromInput) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
    if (from > to) {
      fromSlider.value = to;
      fromInput.value = to;
    } else {
      fromInput.value = from;
    }
    updateGenomeTitle();
}
    
function controlToSlider(fromSlider, toSlider, toInput) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
    setToggleAccessible(toSlider);
    if (from <= to) {
      toSlider.value = to;
      toInput.value = to;
    } else {
      toInput.value = from;
      toSlider.value = from;
    }
    updateGenomeTitle();
}

fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);



const dropzone_text = document.getElementById("file_dropzone");

async function upload_file(files) {

    const path = files[0].path;

    if (path.split('.').pop() != "txt") {
        new window.Notification("Wrong input file extension", {body: "Input file must end with .txt."});
        return;
    }

    dropzone_text.innerText = "Input file: " + path.substring(path.lastIndexOf('\\') + 1, path.length);

    genome = await window.api.readGenome(path);

    if (!display_full) {
        openParameters();
    }

    updateGenomeRange(genome.length);

}

const clickzone = document.getElementById("file_clickzone");

clickzone.addEventListener("change",  async (e) => {

    e.stopPropagation();
    e.preventDefault();

    const files = e.currentTarget.files;
    
    upload_file(files);

});

const dropzone = document.getElementById("file_dropzone");

dropzone.addEventListener("drop", async (e) => {

    e.stopPropagation();
    e.preventDefault();

    const files = e.dataTransfer.files;

    upload_file(files);

});


const back_button = document.getElementById("back_button");

back_button.addEventListener("click", (e) => {
    
    e.stopPropagation();
    e.preventDefault();
  
    window.close();
  
});

function getValue(name) {
  
  const value = document.getElementById(name).value;
  if (value.indexOf('.') != - 1) {
    return parseFloat(value);
  } else {
    return parseInt(value, 10);
  }

}

// l;ater redo lamp button to be nicer

const LAMP_button = document.getElementById("LAMP_button");

LAMP_button.addEventListener("click", (e) => {

    const DO_SKIP = document.getElementById("skip_input").checked;
    
    const START = getValue("genome_from_input") - 1;
    const END = getValue("genome_to_input") - 1;

    var DO_PARTIAL = true;
    if (START == 0 && END == genome.length - 1) {
      DO_PARTIAL= false;
    }

    const input = {
      "COMPUTING": {
        "THREADS": getValue("threads_input"),
        "DOUBLE_DIVERGENCE": getValue("divergence_input"),
        "DO_SKIP": DO_SKIP ? true : false,
      },
      "PRIMER_SEARCH": {
        "LENGTH_RANGE": [ getValue("length_from_input"), getValue("length_to_input")],
        "NA_PLUS": getValue("na_plus_input"),
        "RMV_REPEAT_AMOUNT": getValue("max_repeat_input"),
        "GC_RANGE": [ getValue("GC_from_input"), getValue("GC_to_input")],
        "TM_RANGE": [ getValue("Tm_from_input"), getValue("Tm_to_input")],
      },
      "PRIMER_SORTING": {
        "POSITIONS": [ false, false, true, false, true, true],
        "DISTANCE_RANGE": [getValue("F3-F2_from_input"), getValue("F3-F2_to_input"),
          getValue("F2-F1c_from_input"), getValue("F2-F1c_to_input"), 
          getValue("F1c-B1c_from_input"), getValue("F1c-B1c_to_input"),  
          getValue("B1c-B2_from_input"), getValue("B1c-B2_to_input"), 
          getValue("B2-B3_from_input"), getValue("B2-B3_to_input")],
        "AMPLICON_RANGE": [getValue("amplicon_from_input"), getValue("amplicon_to_input")],
        "LENGTH_MAX_DIFF": getValue("length_diff_input"),
        "TM_MAX_DIFF": getValue("Tm_diff_input")
      },
      "DIMER": {
        "DIMER_END": getValue("dimer_input")
      },
      "GENOME": {
        "DO_PARTIAL": DO_PARTIAL,
        "START": START,
        "END": END,
        "GENOME": genome
      }
    };

    window.api.LAMP(input);
});