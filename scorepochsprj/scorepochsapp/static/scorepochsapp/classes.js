class Cfile {
  constructor() {
    this.json_data = undefined;
    this.channels_number = 0;
    this.samples_number = 0;
    this.sampling_frequency = 0;
    this.file_name = '';
    this.total_recording_time = 0;
    this.max_abs_data_value = 0.0;
  }

  update(json_data) {
    this.json_data = json_data;
    this.channels_number = this.json_data['channels_number'];
    this.samples_number = this.json_data["samples_number"];
    this.sampling_frequency = this.json_data['sampling_frequency'];
    this.file_name = this.json_data['file_name'];
    this.channels_names = this.json_data['channels_names'];
    this.total_recording_time = this.samples_number / this.sampling_frequency;
    this.max_abs_data_value = this.json_data['max_abs_data_value'];
    this.updateUIInfo();
  }

  updateUIInfo() {
    document.getElementById("nav__file-info__channels-number").innerHTML = this.channels_number;
    document.getElementById("nav__file-info__samples-number").innerHTML = this.samples_number;
    document.getElementById("nav__file-info__sampling-frequency").innerHTML = this.sampling_frequency + " samples/s";
    document.getElementById("nav__file-info__file-name").innerHTML = this.file_name; //"S001R01.edf";
    document.getElementById("nav__file-info__total-duration").innerHTML = this.total_recording_time + " s";
  }
}

class Cframe {
  constructor(wrapper, frame) {
    this.width = 0; // default value
    this.height = 0; // default value
    this.wrapper = document.getElementById(wrapper);
    this.frame = document.getElementById(frame);
  }

  getDefaultWidth() {
    return this.wrapper.clientWidth;
  }

  setDefaultWidth() {
    this.setWidth(this.wrapper.clientWidth);
  }

  getDefaultHeight() {
    return this.wrapper.clientHeight;
  }

  setDefaultHeight() {
    this.setHeight(this.wrapper.clientHeight);
  }

  getWidth() {
    return this.width;
  }

  setWidth(width) {
    this.width = width;
    this.frame.style.width = `${width}px`;
  }

  getHeight() {
    return this.height;
  }

  setHeight(height) {
    this.height = height;
    this.frame.style.height = `${height}px`;
  }
}

class CchartFrame extends Cframe {
  constructor(wrapper, frame) {
    super(wrapper, frame);
    this.scroll_callback = undefined;
  }

  setScroll(x_scroll, y_scroll) {
    this.wrapper.scrollLeft = x_scroll;
    this.wrapper.scrollTop = y_scroll;
  }
}

class CchannelsLabels extends Cframe {
  constructor(wrapper, frame) {
    super(wrapper, frame);
  }

  setScroll(x_scroll, y_scroll) {
    this.wrapper.scrollTop = y_scroll;
  }
}

class CepochsLabels extends Cframe {
  constructor(wrapper, frame) {
    super(wrapper, frame);
  }

  setScroll(x_scroll, y_scroll) {
    this.wrapper.scrollLeft = x_scroll;
    this.wrapper.scrollTop = y_scroll;
  }
}

class Cscores extends Cframe {
  constructor(wrapper, frame) {
    super(wrapper, frame);
    this.is_min_score_width = false;
    this.scorepochs_passed = [];
  }

  drawScores(epochs_number, epoch_width) {
    var scores = document.getElementById("scores");
    var i = epochs_number;
    var new_score = undefined;
    var new_score_style = "";
    var min_score_width = 60;
    this.is_min_score_width = (epoch_width > min_score_width);

    while (i) {
      // Crea le label relative ai punteggi
      if (this.is_min_score_width == true) {
        new_score = document.createElement("div");
        new_score_style = `width: ${epoch_width}px; left: ${((i - 1) * epoch_width)}px;`; //height: 0px; top: 0px;
        new_score.setAttribute("style", new_score_style);
        new_score.setAttribute("class", "scores");
        new_score.setAttribute("id", `s${i}`);
        new_score.innerHTML = `0.0000`;
        scores.appendChild(new_score);
      }

      i = i - 1;
    }
  }

  update(epochs_number, epoch_width, scorepochs_result_idx, scorepochs_result_scores, threshold_value) {
    this.removeAllScores();
    this.drawScores(epochs_number, epoch_width);
    var score_label = undefined;
    let ix = scorepochs_result_idx.length;
    var i;
    var epoch_area = undefined;

    let passed = [];
    for (i = 1; i <= ix; i++) {
      score_label = document.getElementById(`s${i}`);
      epoch_area = document.getElementById(`e${i}-area`);
      if ((scorepochs_result_scores[i - 1]) < Number(threshold_value)) {
        if (this.is_min_score_width == true) {
          score_label.style.color = "red";
          epoch_area.classList.remove("highlighted-green");
          epoch_area.classList.add("highlighted-red");
          score_label.innerHTML = `${scorepochs_result_scores[i - 1].toFixed(5)}`; //
        }
        passed.push(0);
      } else {
        if (this.is_min_score_width == true) {
          score_label.style.color = "green";
          epoch_area.classList.remove("highlighted-red");
          epoch_area.classList.add("highlighted-green");
          score_label.innerHTML = `${scorepochs_result_scores[i - 1].toFixed(5)}`; //
        }
        passed.push(1);
      }
    }
    this.scorepochs_passed = passed;
  }

  removeAllScores() {
    var scores_container = document.getElementById("scores");
    var elem = scores_container.firstChild;
    var next_elem;

    while (elem != null) {
      next_elem = elem.nextSibling;
      scores_container.removeChild(elem);
      elem = next_elem;
    }
  }

  setScroll(x_scroll, y_scroll) {
    this.wrapper.scrollLeft = x_scroll;
    this.wrapper.scrollTop = y_scroll;
  }
}

class Cslider extends Cframe {
  constructor(wrapper, frame, update_obj, update_callback) {
    super(wrapper, frame);
    this.cursor1_width = 20;
    this.cursor2_width = 20;
    this.cursor1_value = .0; // init value
    this.cursor2_value = 1.0; // init value
    this.cursor1_x = undefined;
    this.cursor2_x = undefined;
    this.event_x0 = undefined;
    this.event_x1 = undefined;
    this.cursor1_selected = false;
    this.cursor2_selected = false;
    this.frame.addEventListener("mousemove", this.sliderMouseMoveHandler.bind(this));
    this.frame.addEventListener("mouseleave", this.sliderMouseleaveHandler.bind(this));
    this.cursor1 = document.getElementById("cursor1");
    this.cursor2 = document.getElementById("cursor2");
    this.cursor1.addEventListener("mousedown", this.cursor1MousedownHandler.bind(this));
    this.cursor1.addEventListener("mouseup", this.cursor1MouseupHandler.bind(this));
    this.cursor2.addEventListener("mousedown", this.cursor2MousedownHandler.bind(this));
    this.cursor2.addEventListener("mouseup", this.cursor2MouseupHandler.bind(this));

    this.cursor1.style.width = `${this.cursor1_width}px`;
    this.cursor2.style.width = `${this.cursor2_width}px`;
    this.update_obj = update_obj;
    this.update_callback = update_callback;
  }

  setScroll(x_scroll, y_scroll) {
    this.wrapper.scrollLeft = x_scroll;
  }

  cursor1MousedownHandler(e) {
    this.event_x0 = e.pageX;
    this.cursor2_selected = false;
    this.cursor1_selected = true;
  }

  cursor1MouseupHandler(e) {
    this.cursor1_selected = false;
  }

  cursor2MousedownHandler(e) {
    this.event_x0 = e.pageX;
    this.cursor1_selected = false;
    this.cursor2_selected = true;
  }

  cursor2MouseupHandler(e) {
    this.cursor2_selected = false;
  }

  // Calcola la nuova posizione dei cursori sullo schermo, lavora esclusivamente con i pixel a schermo
  // ma per stabilire una posizione a prescindere dallo zoom, dovremo successivamente convertire in un valore 0÷1
  sliderMouseMoveHandler(e) {
    if (this.cursor1_selected) {
      this.event_x1 = e.pageX;
      var delta_x = (this.event_x1 - this.event_x0);
      if ((this.cursor1_x + delta_x) > (this.width - this.cursor1_width)) {
        this.cursor1_x = (this.width - this.cursor1_width);
      } else if ((this.cursor1_x + delta_x) < 0) {
        this.cursor1_x = 0;
      } else {
        this.cursor1_x = this.cursor1_x + delta_x;
        this.event_x0 = this.event_x1;
      }
      this.updatePosition();
    }
    if (this.cursor2_selected) {
      this.event_x1 = e.pageX;
      var delta_x = (this.event_x1 - this.event_x0);
      if ((this.cursor2_x + delta_x) > (this.width - this.cursor2_width)) {
        this.cursor2_x = (this.width - this.cursor2_width);
      } else if ((this.cursor2_x + delta_x) < 0) {
        this.cursor2_x = 0;
      } else {
        this.cursor2_x = this.cursor2_x + delta_x;
        this.event_x0 = this.event_x1;
      }
      this.updatePosition();
    }
  }

  sliderMouseleaveHandler(e) {
    this.cursor1_selected = false;
    this.cursor2_selected = false;
  }

  updatePosition() {
    //aggiorno il value
    this.cursor1_value = this.cursor1_x / this.width;
    this.cursor2_value = (this.cursor2_x + this.cursor2_width) / this.width;
    this.update();
  }

  update() {
    this.cursor1_x = this.cursor1_value * this.width;
    this.cursor2_x = this.cursor2_value * this.width - this.cursor2_width;

    //carico i px dai value
    this.cursor1.style.left = `${this.cursor1_x}px`;
    this.cursor2.style.left = `${this.cursor2_x}px`;

    this.action();
  }

  action() {
    if ((this.update_obj) == undefined) {
      //this.update_callback(this.width, this.cursor1_value, this.cursor2_value);
      this.update_callback();
    } else {
      //this.update_callback.call(this.update_obj);
    }
  }
}

class CxScrollbar extends Cframe {
  constructor(wrapper, frame, update_obj, update_callback) {
    super(wrapper, frame);
    this.update_obj = update_obj;
    this.update_callback = update_callback;
    this.wrapper.addEventListener("scroll", this.action.bind(this));
  }

  action() {
    if ((this.update_obj) == undefined) {
      this.update_callback(this.wrapper.scrollLeft, 0);
    } else {
      this.update_callback.call(this.update_obj, this.wrapper.scrollLeft, 0);
    }
  }
}

class CyScrollbar extends Cframe {
  constructor(wrapper, frame, update_obj, update_callback) {
    super(wrapper, frame);
    this.update_obj = update_obj;
    this.update_callback = update_callback;
    this.wrapper.addEventListener("scroll", this.action.bind(this));
  }

  action() {
    if ((this.update_obj) == undefined) {
      this.update_callback(0, this.wrapper.scrollTop);
    } else {
      this.update_callback.call(this.update_obj, 0, this.wrapper.scrollTop);
    }
  }
}

class CnumericUI {
  constructor(elementId, min, max, predef, step, update_obj, update_callback) {
    this.min = min;
    this.max = max;
    this.value = predef;
    this.prev_value = predef;
    this.DOMelement = document.getElementById(elementId);
    this.DOMelement.addEventListener("change", this.changeHandler.bind(this));
    this.DOMelement.setAttribute("min", min);
    this.DOMelement.setAttribute("max", max);
    this.DOMelement.setAttribute("value", predef);
    this.DOMelement.setAttribute("step", step);
    this.min_message = "";
    this.max_message = "";
    this.update_obj = update_obj;
    this.update_callback = update_callback;
  }

  changeHandler(e) { //   intervenire qui per gestire il prev_value; quando l'esecuzione viene chiamata dall'elemento DOM, non c'è salvataggio dell'ultimo valore
    this.prev_value = this.value; // NEW Salvo il valore attuale prima di modificarlo
    this.value = Number(e.target.value);
    this.validate(this.value);
    this.action();
  }

  action() {
    if ((this.update_obj) == undefined) {
      this.update_callback();
    } else {
      this.update_callback.call(this.update_obj);
    }
  }

  validate(value) {
    if (value < this.min) {
      this.DOMelement.value = this.min;
      this.value = this.min;
      alert(this.min_message);
    } else if (value > this.max) {
      this.DOMelement.value = this.max;
      this.value = this.max;
      alert(this.max_message);
    } else {
      this.value = value;
    }
  }

  valueUpdate(value) {
    this.prev_value = this.value; // Salvo il valore attuale prima di modificarlo
    this.value = value;
    this.validate(this.value);
    this.DOMelement.value = this.value;
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.valueUpdate(value);
    this.action();
  }

  setValueNoCallback(value) {
    this.DOMelement.removeEventListener("change", this.changeHandler);
    this.valueUpdate(value);
    this.DOMelement.addEventListener("change", this.changeHandler.bind(this));
  }

  restorePreviousValue() {
    alert("Previous value restored");
    this.value = this.prev_value;
    this.setValueNoCallback(this.value);
    this.prev_value = this.value;
  }
}

class CepochDuration extends CnumericUI {
  constructor(elementId, min, max, predef, step, contextObj, updateCallback) {
    super(elementId, min, max, predef, step, contextObj, updateCallback);
    this.min_message = `Epochs duration must be at least ${this.min} s`;
    this.max_message = `Epochs duration must be smaller or equal than ${this.max} s`;
    this.total_recording_time = 0;
    this.updateMax();
  }

  setTotalRecordingTime(duration) {
    this.total_recording_time = duration;
    this.updateMax();
  }

  updateMax() {
    this.max = Math.floor(this.total_recording_time / 3); // Ristabilisce il valore massimo dell'input pari alla durata massima di un'epoca
    this.DOMelement.setAttribute("max", this.max);
    this.max_message = `Epochs duration must be smaller or equal than ${this.max} s`;
  }
}

class Camplitude extends CnumericUI {
  constructor(elementId, min, max, predef, step, contextObj, updateCallback) {
    super(elementId, min, max, predef, step, contextObj, updateCallback);
    this.min_message = `Amplitude factor must be at least ${this.min}`;
    this.max_message = `Amplitude factor must be smaller or equal than ${this.max}`;
  }
}

class Cthreshold extends CnumericUI {
  constructor(elementId, min, max, predef, step, contextObj, updateCallback) {
    super(elementId, min, max, predef, step, contextObj, updateCallback);
    this.min_message = `Score threshold must be at least ${this.min}`;
    this.max_message = `Score threshold must be smaller or equal than ${this.max}`;
  }
}

class CbestEpochs extends CnumericUI {
  constructor(elementId, min, max, predef, step, contextObj, updateCallback) {
    super(elementId, min, max, predef, step, contextObj, updateCallback);
    this.min_message = `Best epochs must be at least ${this.min}`;
    this.max_message = `Best epochs must be smaller or equal than ${this.max}`;
  }

  updateMax(max_value) {
    // Ristabilisce il valore massimo dell'input pari alla durata massima di un'epoca
    this.max = max_value
    this.DOMelement.setAttribute("max", this.max);
    this.max_message = `Best epochs must be smaller or equal than ${this.max}`;
  }
}

class CsvgChannels {
  constructor(frame_id) {
    this.frame = document.getElementById(frame_id);
    this.viewport_width = 0;
    this.viewport_height = 0;
    this.amplitude = 1000; // predef
    this.data = undefined;
    this.samples_number = 0;
    this.channels_number = 0;
  }

  setAmplitude(value) {
    this.amplitude = value;
  }

  getAmplitude() {
    return this.amplitude;
  }

  getProperties() {
    this.viewport_width = this.frame.clientWidth;
    this.viewport_height = this.frame.clientHeight;
  }

  setViewport() {
    this.frame.innerHTML = `<svg id="svg-canvas" width="${this.viewport_width}" height="${this.viewport_height}"></svg>`;
  }

  channelDraw(data_array, viewport_width, samples_number, amplitude, vertical_offset) {
    var step = viewport_width / samples_number;
    var svg_graph = "";
    var x0, x1, y1 = 0;

    svg_graph = '<polyline points="';
    for (let i = 0; i < samples_number; i++) {
      x1 = Math.floor(i * step);
      if (x1 == x0) {
        continue;
      } else {
        x0 = x1; // Scarta nuovi valori che andrebbero collocati sullo stesso x (sottocampionamento)
        y1 = Math.floor(vertical_offset + (data_array[i]) * amplitude * (-1));
        svg_graph = svg_graph + String(x1) + ',' + String(y1) + ' ';
      }
    }
    svg_graph = svg_graph + '" fill="none" stroke="black" stroke-width="1"/>';
    return svg_graph;
  }

  draw() {
    // Disegno la traccia sull'area preposta al svg
    var svg_graph_channel_height = this.viewport_height / this.channels_number;
    var svg_canvas = document.getElementById("svg-canvas");
    var svg_elements = "";
    for (let i = 0; i < this.channels_number; i++) {
      var svg_graph_vert_offset = (svg_graph_channel_height / 2) + (svg_graph_channel_height) * i;
      var j = i + 1;
      var channel_id = `ch${j}_data`;
      svg_elements = svg_elements + this.channelDraw(this.data[channel_id], this.viewport_width, this.samples_number, this.amplitude, svg_graph_vert_offset);
      svg_canvas.innerHTML = svg_elements;
    }
  }

  update(data, samples_number, channels_number) {
    this.data = data;
    this.samples_number = samples_number;
    this.channels_number = channels_number;
    this.getProperties();
    this.setViewport();
    this.draw();
  }
}

class CsvgMarkers {
  constructor(frame_id) {
    this.frame = document.getElementById(frame_id);
    this.viewport_width = 0;
    this.viewport_height = 0;
  }

  getProperties() {
    this.viewport_width = this.frame.clientWidth;
    this.viewport_height = this.frame.clientHeight;
  }

  setViewport() {
    this.frame.innerHTML = `<svg id="svg-canvas-markers" width="${this.viewport_width}" height="${this.viewport_height}"></svg>`;
  }

  draw(slider_width, cursor1_value, cursor2_value) {
    // Disegno le linee verticali che rappresentano i marker A-B sull'area preposta al svg
    var svg_canvas = document.getElementById("svg-canvas-markers");
    var svg_elements = "";
    svg_elements += `<line x1="${cursor1_value * slider_width}" y1="0" x2="${cursor1_value * slider_width}" y2="${this.viewport_height}" style="stroke:rgb(255,0,0);stroke-width:2" />`;
    svg_elements += `<line x1="${cursor2_value * slider_width}" y1="0" x2="${cursor2_value * slider_width}" y2="${this.viewport_height}" style="stroke:rgb(255,0,0);stroke-width:2" />`;
    svg_canvas.innerHTML = svg_elements;
  }

  update(slider_width, cursor1_value, cursor2_value) {
    this.getProperties();
    this.setViewport();
    this.draw(slider_width, cursor1_value, cursor2_value);
  }

  setScroll(x_scroll, y_scroll) {
    this.frame.scrollLeft = x_scroll;
  }
}

class Cepochs {
  constructor(epochs_grid_container, epochs_labels_container, update_obj, update_callback) {
    this.grid_container = document.getElementById(epochs_grid_container);
    this.labels_container = document.getElementById(epochs_labels_container);
    this.epochs_number = 0; // default
    this.epoch_width = 0; // default
    this.epochs_selected = undefined;
    this.total_recording_time = 0;
    this.epoch_duration = 1; // predef
    this.update_obj = update_obj;
    this.update_callback = update_callback;
  }

  // Calcola il numero di epoche e la larghezza occupata a video
  getEpochsProperties() {
    this.epochs_number = Math.floor(this.total_recording_time / this.epoch_duration);
    this.epoch_width = (this.grid_container.clientWidth * (this.epoch_duration / this.total_recording_time));
  }

  // Disegno le epoche e le label di selezione
  draw() {
    var i = this.epochs_number;
    var new_epoch = undefined;
    var new_label = undefined;
    var new_epoch_style = "";
    var new_label_style = "";
    var min_epoch_width = 60;
    var is_min_epoch_width = (this.epoch_width > min_epoch_width);

    while (i) {
      // Crea le aree corrispondenti alle epoche
      new_epoch = document.createElement("div");
      new_epoch_style = `width: ${this.epoch_width}px;`;
      new_epoch_style = new_epoch_style + `left: ${((i - 1) * this.epoch_width)}px;`;
      new_epoch.setAttribute("style", new_epoch_style);
      new_epoch.setAttribute("class", "epochs-frame__area");
      new_epoch.setAttribute("id", `e${i}-area`);
      this.grid_container.appendChild(new_epoch);

      // Crea le label relative alle epoche
      if (is_min_epoch_width) {
        new_label = document.createElement("div");
        new_label_style = `width: ${this.epoch_width}px; left: ${((i - 1) * this.epoch_width)}px;`;
        new_label.setAttribute("style", new_label_style);
        new_label.setAttribute("class", "epochs-label");
        new_label.setAttribute("id", `e${i}`);
        new_label.innerHTML = `e${i}`;
        this.labels_container.appendChild(new_label);
        new_label.addEventListener('click', this.epochHighlight.bind(this));
      }

      i = i - 1;
    }
    
    // Quando le epoche sono troppo numerose e non occupano a video la larghezza minima impostata
    // Viene generato un avviso a video, nell'area destinata alle etichette delle epoche
    var message = document.getElementById("epochs-too-many-message");
    if (is_min_epoch_width == false) {
      message.removeAttribute("hidden");
    } else {
      message.setAttribute("hidden", true);
    }
  }

  update(epoch_duration, total_recording_time) {
    this.total_recording_time = total_recording_time;
    this.epoch_duration = epoch_duration;
    this.removeAllEpochs();
    this.getEpochsProperties();
    this.epochsSelectedArrayInit();
    this.draw();
  }

  selectAllEpochs() {
    var all_epochs = document.getElementsByClassName("epochs-frame__area");
    var i = 0;
    for (i = 0; i < all_epochs.length; i++) {
      all_epochs[i].classList.add("highlighted");
    }
    this.epochs_selected.fill(1, 0, this.epochs_number);
    this.action();
  }

  deselectAllEpochs() {
    var all_epochs = document.getElementsByClassName("epochs-frame__area");
    var i = 0;
    for (i = 0; i < all_epochs.length; i++) {
      all_epochs[i].classList.remove("highlighted");
    }
    this.epochs_selected.fill(0, 0, this.epochs_number);
    this.action();
  }

  removeAllEpochs() {
    var elem = this.grid_container.firstChild;
    var label = this.labels_container.firstChild;
    var next_elem;
    var next_label;

    while (elem != null) {
      next_elem = elem.nextSibling;
      this.grid_container.removeChild(elem);
      elem = next_elem;
    }
    while (label != null) {
      next_label = label.nextSibling;
      this.labels_container.removeChild(label);
      label = next_label;
    }
  }

  // Inizializza l'array epochs_selected con la nuova lunghezza, quando viene cambiato il numero delle epoche
  epochsSelectedArrayInit() {
    this.epochs_selected = new Array(this.epochs_number);
    this.epochs_selected.fill(0, 0, this.epochs_number);
  }

  // Handler evidenziazione epoche selezionate al click della label della epoca
  epochHighlight(e) {
    var epoch = document.getElementById(`${e.target.id}-area`);
    epoch.classList.toggle("highlighted");

    function epochIdToIndex(epoch_id) { //epoch_id è una stringa esempio: 'e3'
      return Number((epoch_id).slice(1) - 1);
    }

    if (epoch.classList.contains("highlighted")) {
      this.epochs_selected[epochIdToIndex(e.target.id)] = 1;
    } else {
      this.epochs_selected[epochIdToIndex(e.target.id)] = 0;
    }
    this.action();
  }

  // Per ogni elemento con valore pari a uno dell'array epochs_selected, viene aggiunta la classe "highlighted"
  epochsHighlightSelected(){
    for(let i = 0;i < this.epochs_selected.length;i++){
      var epoch = document.getElementById(`e${i+1}-area`);
      if (this.epochs_selected[i]){
        if (epoch.classList.contains("highlighted") == false){
          epoch.classList.add("highlighted");
        }
      } 
    }
  }

  action() {
    if ((this.update_obj) == undefined) {
      this.update_callback();
    } else {
      this.update_callback.call(this.update_obj);
    }
  }
}

class Cchannels {
  constructor(channels_layer, channel_labels_container, update_obj, update_callback) {
    this.channels_layer = document.getElementById(channels_layer);
    this.channels_labels_container = document.getElementById(channel_labels_container);
    this.channels_number = 0;
    this.channels_names = [];
    this.channels_selected = undefined;
    this.channelsSelectedArrayInit();
    this.update_obj = update_obj;
    this.update_callback = update_callback;
  }

  channelsSelectedArrayInit() {
    this.channels_selected = new Array(this.channels_number);
    this.channels_selected.fill(0, 0, this.channels_number);
  }

  // Disegna le label di selezione dei canali e le aree di evidenziazione dei canali
  draw() {
    for (let j = 0; j < this.channels_number; j++) {
      // Creo le label
      var channel_label = document.createElement("div");
      var channel_name = this.channels_names[j];
      channel_label.setAttribute("class", "channel-label");
      channel_label.setAttribute("id", `c${j + 1}`);
      channel_label.innerHTML = `ch ${j + 1} ${channel_name}`;
      channel_label.addEventListener('click', this.channelHighlight.bind(this));
      this.channels_labels_container.appendChild(channel_label);

      // Creo le aree di evidenziazione dei canali
      var channel_area = document.createElement("div");
      channel_area.setAttribute("class", "channel-area");
      channel_area.setAttribute("id", `channelc${j + 1}`);
      this.channels_layer.appendChild(channel_area);
    }
  }

  removeAllChannels() {
    var elem = this.channels_layer.firstChild;
    var label = this.channels_labels_container.firstChild;
    var next_elem;
    var next_label;
    while (elem != null) {
      next_elem = elem.nextSibling;
      this.channels_layer.removeChild(elem);
      elem = next_elem;
    }
    while (label != null) {
      next_label = label.nextSibling;
      this.channels_labels_container.removeChild(label);
      label = next_label;
    }
  }

  // Handler evidenziazione canali selezionati
  channelHighlight(e) {
    var channel = document.getElementById(`channel${e.target.id}`);
    channel.classList.toggle("highlighted");

    function channelIdToIndex(channel_id) { //channel_id è una stringa esempio: 'c13'
      return (Number((channel_id).slice(1)) - 1);
    }

    if (channel.classList.contains("highlighted")) {
      this.channels_selected[channelIdToIndex(e.target.id)] = 1;
    } else {
      this.channels_selected[channelIdToIndex(e.target.id)] = 0;
    }
    this.action();
  }

  selectAllChannels() {
    var all_channels = document.getElementsByClassName("channel-area");
    var i = 0;
    for (i = 0; i < all_channels.length; i++) {
      all_channels[i].classList.add("highlighted");
    }
    this.channels_selected.fill(1, 0, this.channels_number);
    this.action();
  }

  deselectAllChannels() {
    var all_channels = document.getElementsByClassName("channel-area");
    var i = 0;
    for (i = 0; i < all_channels.length; i++) {
      all_channels[i].classList.remove("highlighted");
    }
    this.channels_selected.fill(0, 0, this.channels_number);
    this.action();
  }

  update(channels_number, channels_names) {
    this.channels_number = channels_number;
    this.channels_names = channels_names;
    this.removeAllChannels();
    this.channelsSelectedArrayInit();
    this.draw();
  }

  action() {
    if ((this.update_obj) == undefined) {
      this.update_callback();
    } else {
      this.update_callback.call(this.update_obj);
    }
  }
}

class Cbuttons {
  constructor() {
    this.args = [];
    for (let i = 0; i < arguments.length; i++) {
      this.args[i] = arguments[i];
    }
  }

  setForm() {
    for (let i = 0; i < arguments.length; i++) {
      document.getElementById(this.args[i]).setAttribute("value", arguments[i]);
    }
  }
}

class Cmouse {
  constructor(sensitive_area, target, sensitivity, update_obj, update_callback) { //target = chart_frame
    this.sensitivity = sensitivity;
    this.sensitive_area = document.getElementById(sensitive_area);
    this.sensitive_area.addEventListener("wheel", this.mouseHandler.bind(this));
    this.target = target
    this.update_obj = update_obj;
    this.update_callback = update_callback;

  }

  mouseHandler(e) {
    e.preventDefault();
    var height = this.target.getHeight(); //chart_frame.
    var width = this.target.getWidth(); //chart_frame.

    if (e.altKey) {
      var min_height = 1000;
      var max_height = 6000;
      height = height + e.deltaY * (-1) / 125 * this.sensitivity;

      if (height < min_height) {
        if (height == min_height) {
        } else {
          height = min_height;
          alert("Minimum zoom reached");
        }
      }

      if (height > max_height) {
        if (height == max_height) {
        } else {
          height = max_height;
          alert("Maximum zoom reached");
        }
      }
    }

    if (e.ctrlKey) {
      var min_width = this.target.getDefaultWidth(); //chart_frame.
      var max_width = file.samples_number;
      width = width + e.deltaY * (-1) / 125 * this.sensitivity;

      if (width < min_width) {
        if (width == min_width) {
        } else {
          width = min_width;
          alert("Minimum zoom reached");
        }
      }

      if (width > max_width) {
        if (width == max_width) {
        } else {
          width = max_width;
          alert("Maximum zoom reached");
        }
      }
    }
    this.action(width, height)
  }

  action(width, height) {
    if ((this.update_obj) == undefined) {
      this.update_callback(width, height);
    } else {
      this.update_callback.call(this.update_obj, data.width, height);
    }
  }
}

class Cselect {
  constructor(elementId, presets, update_obj, update_callback) {
    this.update_obj = update_obj;
    this.update_callback = update_callback;
    this.DOMelement = document.getElementById(elementId);
    this.DOMelement.addEventListener("change", this.changeHandler.bind(this));
    this.presets = JSON.parse(presets);
    this.createHTML();
  }

  createHTML() {
    var i_x = this.presets.length;
    var i;
    var select_options = "";
    for (i = 0; i < i_x; i = i + 1) {
      select_options += `<option value="${this.presets[i]}">${this.presets[i]}</option>`
    }

    this.DOMelement.innerHTML = select_options;
  }

  changeHandler(e) {
    this.value = (e.target.value);
    this.action();
  }

  action() {
    if ((this.update_obj) == undefined) {
      this.update_callback(this.value);
    } else {
      this.update_callback.call(this.update_obj, this.value);
    }
  }

  getValue() {
    return this.value;
  }
}

class CajaxRequest {
  constructor(request_id_init, session_timestamp, request_url, get_url, update_obj, update_callback) {
    this.request_id = request_id_init;
    this.session_timestamp = session_timestamp
    this.request_url = request_url;
    this.get_url = get_url;
    this.update_obj = update_obj;
    this.update_callback = update_callback;
  }

  // Richiede ajax_exec che richiede i dati al server
  // selezionato in real time. I risultati vengono passati alla funzione fornita come callback
  ajaxExec(params_value) {
    this.request_id += 1;
    const request = new Request(
      this.request_url,
      {
        method: 'POST',
        headers: { 'X-CSRFToken': CSRF_TOKEN, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, //csrftoken
        mode: 'same-origin', // Do not send CSRF token to another domain.
        body: `params=${params_value}&request-id=${this.request_id}&session-timestamp=${this.session_timestamp}`
      });
    return fetch(request);
  }

  // Recupera i risultati dopo l'esecuzione di ajaxExec
  ajaxGet() {
    fetch(`${this.get_url}/${this.session_timestamp}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
      .then(data => this.action(data))
      .catch(error => console.log("ajax get error: " + error));
  }

  action(data) {
    if (data.id == this.request_id) {
      if ((this.update_obj) == undefined) {
        this.update_callback(data);
      } else {
        this.update_callback.call(this.update_obj, data);
      }
    }
  }

  sendRequest(params_value) {
    var ajax_exec_promise = this.ajaxExec(params_value);
    ajax_exec_promise.then(response => this.ajaxGet());
  }
}