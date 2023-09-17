app = {
    session_timestamp: '',
    epoch_duration: 1,
    filter_preset: "Normal",
    scorepochs_idx: [],
    scorepochs_scores: [],
    a: 0.0, //pref, updated on init
    b: 0.0, //pref, updated on init
}

app.session_timestamp = document.getElementById("session-timestamp").value;
var file = new Cfile();

var first_init = true;

var current_data = new CajaxRequest(1000000000, app.session_timestamp, "/scorepochsapp/datarequest", "dataget", undefined, onDataLoad);
var scorepochs_data = new CajaxRequest(0, app.session_timestamp, "/scorepochsapp/scorepochsexec", "scorepochsget", undefined, onScorepochsResults);

var filter_presets = document.getElementById("filter-presets").value;
var filters = new Cselect("filter", filter_presets, undefined, onFilterChange);

var chart_frame = new CchartFrame("chart-frame-wrapper", "chart-frame");
var channels = new Cchannels("chart-frame__channels-layer", "channels-labels", undefined, onSelectionUpdate);
var channels_labels = new CchannelsLabels("channels-labels-wrapper", "channels-labels");
var svg = new CsvgChannels("chart-frame__svg-layer");
var markers = new CsvgMarkers("chart-frame__markers-layer");
var epochs = new Cepochs("chart-frame__epochs-layer", "epochs-labels", undefined, onSelectionUpdate);

var scores = new Cscores("scores-wrapper", "scores");
var epochs_labels = new CepochsLabels("epochs-labels-wrapper", "epochs-labels");
var slider = new Cslider("slider-wrapper", "slider", undefined, onABSelectionUpdate);

var ui_epoch_duration = new CepochDuration("epochs-duration", 1, 5, 1, 1, undefined, onEpochDurationChange);
var ui_amplitude = new Camplitude("amplitude", 0.000001, 1000000, 1, 0.01, undefined, update);
var ui_score_threshold = new Cthreshold("score-threshold", 0.01, 1.0, .5, 0.001, undefined, onScoreThresholdChange);
var ui_best_epochs = new CbestEpochs("best-epochs", 3, 1000000, 3, 1, undefined, onBestEpochsChange);

var psd_button_ep = new Cbuttons("psd-ep-epochs-selected", "psd-ep-channels-selected", "psd-ep-epoch-duration", "psd-ep-session-timestamp");
var psd_button_ch = new Cbuttons("psd-ch-epochs-selected", "psd-ch-channels-selected", "psd-ch-epoch-duration", "psd-ch-session-timestamp");
var corrmatrix_button = new Cbuttons("corrmatrix-epoch-duration", "corrmatrix-session-timestamp");
var scorepochs_button = new Cbuttons("scorepochs-epoch-duration", "scorepochs-session-timestamp");
var scorevector_button = new Cbuttons("scorevector-epoch-duration", "scorevector-session-timestamp");
var scoredistribution_button = new Cbuttons("scoredistribution-epoch-duration", "scoredistribution-session-timestamp");
var export_button = new Cbuttons("export-cfg", "export-session-timestamp");

// Aggiunge all'oggetto export_button due metodi che consentono di gestirne l'attivazione o disattivazione in determinati
// momenti
export_button.enable = function (DOMelement) { document.getElementById(`${DOMelement}`).removeAttribute("disabled"); };
export_button.disable = function (DOMelement) { document.getElementById(`${DOMelement}`).setAttribute("disabled", "disabled"); };

var mouse = new Cmouse("chart-frame__epochs-layer", chart_frame, 500, undefined, zoom);

var x_scrollbar = new CxScrollbar("x-scrollbar-wrapper", "x-scrollbar", undefined, scroll);
var y_scrollbar = new CyScrollbar("y-scrollbar-wrapper", "y-scrollbar", undefined, scroll);



function onEpochDurationChange() {
    update();
    // Disabilita il pulsante di esportazione finchè non sono disponibili i dati di punteggio forniti da scorepochs
    export_button.disable("export-button");
}

function onSelectionUpdate() {
    psd_button_ep.setForm(`[${epochs.epochs_selected}]`, `[${channels.channels_selected}]`, app.epoch_duration, app.session_timestamp);
    psd_button_ch.setForm(`[${epochs.epochs_selected}]`, `[${channels.channels_selected}]`, app.epoch_duration, app.session_timestamp);
    export_button.setForm(exportCfgJSON(), app.session_timestamp);
}

function onABSelectionUpdate() {
    markers.update(slider.width, slider.cursor1_value, slider.cursor2_value)
    app.a = slider.cursor1_value;
    app.b = slider.cursor2_value;
    export_button.setForm(exportCfgJSON(), app.session_timestamp);
}

function onScorepochsResults(data) {
    app.scorepochs_idx = data.idx;
    app.scorepochs_scores = data.scores;
    ui_best_epochs.updateMax(epochs.epochs_number);
    onBestEpochsChange();
    onScoreThresholdChange();
    export_button.enable("export-button");
}

function onBestEpochsChange() {
    var min_best_score = app.scorepochs_scores[app.scorepochs_idx[ui_best_epochs.getValue() - 1]];
    ui_score_threshold.setValueNoCallback.call(ui_score_threshold, min_best_score);
    scores.update(epochs.epochs_number, epochs.epoch_width, app.scorepochs_idx, app.scorepochs_scores, ui_score_threshold.getValue());
    export_button.setForm(exportCfgJSON(), app.session_timestamp);
}

function onScoreThresholdChange() {
    scores.update(epochs.epochs_number, epochs.epoch_width, app.scorepochs_idx, app.scorepochs_scores, ui_score_threshold.getValue());
    export_button.setForm(exportCfgJSON(), app.session_timestamp);
    ui_best_epochs.updateMax(epochs.epochs_number);
    // numero di epoche che passano la soglia: lo ottengo sommando tutti gli elementi 1 dell'array scorepochs_passed
    const best_epochs = scores.scorepochs_passed.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    if (best_epochs < 3) {
        ui_score_threshold.restorePreviousValue.call(ui_score_threshold);
    } else {
        ui_best_epochs.setValueNoCallback.call(ui_best_epochs, best_epochs);
    }
}

function onFilterChange(value) {
    app.filter_preset = value;
}

function onFilterApply() {
    if (confirm(`You're applying ${app.filter_preset} filter. Do you want proceed?`) == true) {
        var current_data_request = `{"filter-preset":"${app.filter_preset}"}`;
        current_data.sendRequest(current_data_request);
        alert(`${app.filter_preset} filter applied`);
    }
}

function init() {
    // Blocco l'esportazione della registrazione fino al caricamento dei risultati di scorepochs
    export_button.disable("export-button");

    //Recupera le informazioni dalla registrazione caricata
    var current_data_request = `{"filter-preset":"${app.filter_preset}"}`;
    current_data.sendRequest(current_data_request);

    // Inizializza il frame dell'area di lavoro
    chart_frame.setDefaultWidth();
    chart_frame.setHeight(1500);
    channels_labels.setDefaultWidth();
    channels_labels.setHeight(1500);
    epochs_labels.setDefaultWidth();
    slider.setDefaultWidth();
    slider.setDefaultHeight(); // SERVE?
    scores.setDefaultWidth()
    x_scrollbar.setDefaultWidth();
    y_scrollbar.setDefaultHeight();
    app.a = slider.cursor1_value;
    app.b = slider.cursor2_value;
}

function onDataLoad(data) {
    file.update(data);
    // Eseguito solo al primo caricamento del file, normalizza la visualizzazione
    // della registrazione rispetto al valore più elevato (in valore assoluto) ottenuto nella registrazione
    if (first_init == true) {
        var chart_frame_height = chart_frame.getHeight();
        var max_abs_data_value = file.max_abs_data_value;
        var channels_number = file.channels_number
        var amplitude = Math.floor((1 / (2 * max_abs_data_value)) * (Number(chart_frame_height) / channels_number));
        ui_amplitude.setValue(amplitude);
        first_init = false;
    }
    svg.update(file.json_data, file.samples_number, file.channels_number);
    channels.update(file.channels_number, file.channels_names);
    epochs.update(app.epoch_duration, file.total_recording_time);
    ui_epoch_duration.setTotalRecordingTime(file.total_recording_time);
    var current_data_request = `{"epoch-duration":${app.epoch_duration}}`;
    scorepochs_data.sendRequest(current_data_request);
}

function update() {
    app.epoch_duration = ui_epoch_duration.getValue();
    svg.setAmplitude(ui_amplitude.getValue());
    var current_data_request = `{"epoch-duration":${app.epoch_duration}}`;
    scorepochs_data.sendRequest(current_data_request);
    updateGroup1();
    updateForms();
}

function scroll(x_scroll, y_scroll) {
    chart_frame.setScroll(x_scroll, y_scroll);
    epochs_labels.setScroll(x_scroll, 0);
    scores.setScroll(x_scroll, 0);
    slider.setScroll(x_scroll, 0);
    markers.setScroll(x_scroll, 0);
    channels_labels.setScroll(0, y_scroll);
}

function zoom(width, height) {
    chart_frame.setWidth(width);
    chart_frame.setHeight(height);
    x_scrollbar.setWidth(width);
    y_scrollbar.setHeight(height);
    slider.setWidth(width);
    channels_labels.setHeight(height);
    updateGroup1();
    scores.update(epochs.epochs_number, epochs.epoch_width, app.scorepochs_idx, app.scorepochs_scores, ui_score_threshold.getValue());
}

function updateGroup1() {
    slider.update();
    markers.update(slider.width, slider.cursor1_value, slider.cursor2_value);
    svg.update(file.json_data, file.samples_number, file.channels_number);
    channels.update(file.channels_number, file.channels_names);
    epochs.update(app.epoch_duration, file.total_recording_time);
}

function updateForms() {
    onSelectionUpdate();
    corrmatrix_button.setForm(app.epoch_duration, app.session_timestamp);
    scorepochs_button.setForm(app.epoch_duration, app.session_timestamp);
    scorevector_button.setForm(app.epoch_duration, app.session_timestamp);
    scoredistribution_button.setForm(app.epoch_duration, app.session_timestamp);
    export_button.setForm(exportCfgJSON(), app.session_timestamp);
}

function onCrop() {
    if (confirm("Do you really want to crop between A and B?") == true) {
        var current_data_request = `{"action":"crop","a":${app.a},"b":${app.b}}`;
        current_data.sendRequest(current_data_request);
        slider.cursor1_value = 0.0;
        slider.cursor2_value = 1.0;
        slider.update();
    }
}

function onDelete() {
    if (confirm("Do you really want to delete between A and B?") == true) {
        var current_data_request = `{"action":"delete","a":${app.a},"b":${app.b}}`;
        current_data.sendRequest(current_data_request);
        slider.cursor1_value = 0.0;
        slider.cursor2_value = 1.0;
        slider.update();
    }
}

function onScorepochsResultAddToExportClick() {
    // Crea il merge di epochs.epochs_selected (epoche selezionate manualmente) e di scores.scorepochs_passed (epoche che hanno
    // passato il punteggio soglia di scorepochs)
    for (let i = 0; i < epochs.epochs_selected.length; i++) {
        if ((epochs.epochs_selected[i] + scores.scorepochs_passed[i]) > 0) {
            epochs.epochs_selected[i] = 1;
        } else {
            epochs.epochs_selected[i] = 0;
        }
    }
    epochs.epochsHighlightSelected();
}

function exportCfgJSON() {
    // Crea un oggetto json con l'array delle epoche da esportare, necessario nel caso in cui si proceda con
    // l'esportazione della selezione (e non dell'intera registrazione)
    var json_data = {};
    json_data['epochs-selected'] = epochs.epochs_selected;
    return JSON.stringify(json_data);
}

function onLoad() {
    init();
    update();
}

// Inizializzazione GUI
document.onload = onLoad();