from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from pathlib import Path
import os
import json
import math

from .filedecode import edfdecode, csvdecode
from .datastorage import sessions_manager
from .scorepochs import scorEpochs
from .scorepochscfg import scorepochs_f_range, filters_cfg
from .analysis import Corr_matrix_html, powerSpectrumByEpochsToHTML, powerSpectrumByChannelsToHTML, scoreVectorHtml, scoreDistributionHtml
from .export import exportEdf, exportCsv

def index(request):
    # Fornisce all'utente la pagina dell'interfaccia grafica principale
    template = loader.get_template('scorepochsapp/index.html')
    context = {}
    return HttpResponse(template.render(context, request))



def edfstore(request):
    # Servizio destinato a non fornire un contenuto visibile all'utente
    # Gestisce il file EDF ricevuto
    template = loader.get_template('scorepochsapp/opengui.html') #Pagina di servizio, serve per trasmettere il timestamp di sessione, chiusa subito dopo 
    uploaded_file = request.FILES['edf_file_select']
    file_type = request.POST['file-type']
    session_timestamp = request.POST['session-timestamp']
    source_file_name = uploaded_file.name  # nome originale del file caricato

    # Creo una nuova sessione relativa al file caricato
    sessions_manager.createSession(session_timestamp)
    session_data = sessions_manager.getSession(session_timestamp)

    if (file_type == 'edf'):
        with open("tmp_{}.edf".format(session_timestamp), "wb") as f:
            uploaded_file_data = uploaded_file.read()
            f.write(uploaded_file_data)
        edfdecode("tmp_{}.edf".format(session_timestamp),
                  source_file_name, session_data)
        os.remove("tmp_{}.edf".format(session_timestamp))

    context = {"session_timestamp": session_timestamp}
    return HttpResponse(template.render(context, request))



def csvimport(request):
    # Fornisce all'utente la pagina di configurazione dell'importazione CSV
    template = loader.get_template('scorepochsapp/csvimport.html')
    uploaded_file = request.FILES['csv_file_select']
    file_type = request.POST['file-type']
    session_timestamp = request.POST['session-timestamp']
    source_file_name = uploaded_file.name  # nome originale del file caricato

    if (file_type == 'csv'):
        with open("tmp_{}.csv".format(session_timestamp), "wb") as f:
            uploaded_file_data = uploaded_file.read()
            f.write(uploaded_file_data)

    context = {'source_file_name': source_file_name,
               "session_timestamp": session_timestamp}
    return HttpResponse(template.render(context, request))



def csvstore(request):
    # Servizio destinato a non fornire un contenuto visibile all'utente
    # Gestisce il del file CSV ricevuto
    template = loader.get_template('scorepochsapp/opengui.html')
    schema = request.POST['schema']
    separator = request.POST['separator']
    decimal_point = request.POST['decimal-point']
    sampling_frequency = int(request.POST['sampling-frequency'])
    source_file_name = request.POST['source-file-name'] # nome originale del file caricato
    session_timestamp = request.POST['session-timestamp']

    # Creo una nuova sessione relativa al file caricato
    sessions_manager.createSession(session_timestamp)
    session_data = sessions_manager.getSession(session_timestamp)

    if (separator == ','):
        delimiter = ','
    elif (separator == ';'):
        delimiter = ';'
    elif (separator == 'space'):
        delimiter = ' '
    elif (separator == 'tab'):
        delimiter = '\t'

    csv_conversion_status = csvdecode(
        "tmp_{}.csv".format(session_timestamp), source_file_name, schema, delimiter, decimal_point, sampling_frequency, session_data)

    # Rimuove il file temporaneo
    os.remove("tmp_{}.csv".format(session_timestamp))

    if (csv_conversion_status):
        response = '<script>window.open("gui","_self");window.close();</script>'
    else:
        response = "An error importing csv has occourred. Please check csv format and importing options"

    context = {"session_timestamp": session_timestamp}

    return HttpResponse(template.render(context, request))



def gui(request):
    # Fornisce all'utente la pagina dell'interfaccia grafica principale
    template = loader.get_template('scorepochsapp/gui.html')
    session_timestamp = request.POST['session-timestamp']

    flt_presets = []

    #Carica i filtri dal file di configurazione
    for flt in filters_cfg:
        flt_presets.append(flt[0])

    flt_presets_str = str(flt_presets)
    filter_presets = flt_presets_str.replace("'", '"')

    context = {'filter_presets': filter_presets,
               "session_timestamp": session_timestamp}
    return HttpResponse(template.render(context, request))



def scorepochs(request):
    # Fornisce all'utente vista con la tabella dei punteggi delle epoche, dopo aver eseguito Scorepochs
    template = loader.get_template('scorepochsapp/scorepochs.html')

    scorepochs_epoch_duration_ui = request.POST['scorepochs-epoch-duration']

    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)

    t_ep = int(scorepochs_epoch_duration_ui)
    fs = int(session_data.sampling_frequency)

    cfg = {'freqRange': scorepochs_f_range, 'fs': fs, 'windowL': t_ep}

    idx_best, epoch, scores, score_vector = scorEpochs(
        cfg, session_data.raw_data)

    json_obj = {}
    json_obj['idx'] = idx_best.tolist()
    json_obj['scores'] = scores.tolist()
    out_json = str(json.dumps(json_obj))
    context = {'scorepochs_scores': out_json}
    return HttpResponse(template.render(context, request))



def scorepochsexec(request):
    # Servizio destinato a non fornire un contenuto visibile all'utente
    # Esegue scorepochs utilizzando la durata dell'epoca fornita tramite la chiamata HTTP POST
    # Memorizza il vettore dei punteggi ed il vettore degli indici delle rispettive epoche su session_data
    request_params = request.POST['params']
    params = json.loads(request_params)
    scorepochs_epoch_duration_ui = params['epoch-duration']

    t_ep = int(scorepochs_epoch_duration_ui)

    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)
    session_data.scorepochs_last_request_id = request.POST['request-id']

    fs = int(session_data.sampling_frequency)
    cfg = {'freqRange': scorepochs_f_range, 'fs': fs, 'windowL': t_ep}
    idx_best, epoch, scores, score_vector = scorEpochs(
        cfg, session_data.raw_data)

    # Memorizza i risultati di scorepochs nell'oggetto scorepochs_data
    session_data.idx = idx_best.tolist()
    session_data.scores = scores.tolist()
    return HttpResponse()



def scorepochsget(request, session_timestamp):
    # Servizio destinato a non fornire un contenuto visibile all'utente
    # Recupera i dati dall'oggetto scorepochs_data e li rende disponibili allo script javascript mediante un oggetto JSON
    session_data = sessions_manager.getSession(str(session_timestamp))
    scorepochs_data_idx = session_data.idx
    scorepochs_data_scores = session_data.scores
    scorepochs_data_last_request_id = session_data.scorepochs_last_request_id

    json_obj = {}
    json_obj['idx'] = scorepochs_data_idx
    json_obj['scores'] = scorepochs_data_scores
    json_obj['id'] = scorepochs_data_last_request_id
    out_json = str(json.dumps(json_obj))
    return HttpResponse(out_json)



def datarequest(request):
    # Servizio destinato a non fornire un contenuto visibile all'utente
    # Restituisce la registrazione da visualizzare, sulla base del parametro filter-preset fornito dalla gui tramite la chiamata http post
    request_params = request.POST['params']
    params = json.loads(request_params)

    if 'filter-preset' in params:
        filter_preset = params['filter-preset']
    else:
        filter_preset = ''

    if 'action' in params:
        action = params['action']
    else:
        action = ''

    # crop_request = params['crop-request']
    if 'a' in params:
        a = float(params['a'])
    else:
        a = 0.0

    if 'b' in params:
        b = float(params['b'])
    else:
        b = 0.0

    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)
    session_data.data_last_request_id = request.POST['request-id']

    if (filter_preset != ''):
        # Imposta il filtro sui dati, da restituire con successiva chiamata get_data
        for flt in filters_cfg:
            if (filter_preset == flt[0]):
                session_data.filterSet(flt[0])  # (filtername)
                session_data.filterApply(flt[1])  # (filter function)
                break

    # if (crop_request == True):
    if (action == 'crop'):
        session_data.cropApply(a, b)
    elif (action == 'delete'):
        session_data.deleteApply(a, b)
    return HttpResponse()



def dataget(request, session_timestamp):
    # Servizio destinato a non fornire un contenuto visibile all'utente
    # Recupera i dati (versione normale o elaborata da un o più filtri) e li rende disponibili allo script javascript mediante un oggetto JSON
    session_data = sessions_manager.getSession(str(session_timestamp))
    json_obj = json.loads(session_data.createJSON())
    json_obj['id'] = session_data.data_last_request_id
    out_json = str(json.dumps(json_obj))
    return HttpResponse(out_json)



def corrmatrix(request):
    # Fornisce all'utente la vista della matrice di correlazione
    epoch_duration = int(request.POST['corrmatrix-epoch-duration'])
    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)
    response = Corr_matrix_html(
        epoch_duration, session_data.sampling_frequency, session_data.raw_data, scorepochs_f_range)

    return HttpResponse(response)



def psd(request):
    # Fornisce all'utente la vista dei grafici di PSD
    epochs_selected = json.loads(request.POST['psd-epochs-selected'])
    channels_selected = json.loads(request.POST['psd-channels-selected'])
    epoch_duration = int(request.POST['psd-epoch-duration'])
    mode = request.POST['psd-mode']
    session_timestamp = request.POST['session-timestamp']

    # Trasforma gli array di 0,1 associati alla selezione di canali e epoche in liste di interi con il riferimento al numero
    # di epoche e canali selezionati
    # Esempio: epochs_selected = [0,0,1,0,0,0,1] => [3,7]
    # Aggiunge +1 per passare dalla rappresentazione nativa alla numerazione naturale: indice 0 = epoca 1, indice 1 = epoca 2, ecc...
    def onesArrayToIndexesList(ones_array):
        y = []

        for x in range(0, len(ones_array)):
            if (ones_array[x] == 1):
                # aggiunge +1 all'indice per passare alla rappresentazione naturale
                y.append(x+1)
        return y

    channels_selected_ids = onesArrayToIndexesList(channels_selected)
    epochs_selected_ids = onesArrayToIndexesList(epochs_selected)

    response = ""

    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)

    if (len(channels_selected_ids) != 0) and (len(epochs_selected_ids) != 0):
        if (mode == 'psd-ep'):
            response = powerSpectrumByEpochsToHTML(epoch_duration, session_data.sampling_frequency,
                                                   session_data.raw_data, channels_selected_ids, epochs_selected_ids)
        elif (mode == 'psd-ch'):
            response = powerSpectrumByChannelsToHTML(epoch_duration, session_data.sampling_frequency,
                                                     session_data.raw_data, channels_selected_ids, epochs_selected_ids)
    else:
        response = 'Please select at least one channel and one epoch to proceed</br><button onclick="window.close()">Close</button>'

    return HttpResponse(response)



def scorevector(request):
    # Fornisce all'utente la vista dei vettori di punteggio
    epoch_duration = int(request.POST['scorevector-epoch-duration'])
    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)

    response = scoreVectorHtml(epoch_duration, int(session_data.sampling_frequency), session_data.raw_data,
                               scorepochs_f_range, session_data.channels_names)
    return HttpResponse(response)



def scoredistribution(request):
    # Fornisce all'utente la vista della distribuzione dei punteggi
    epoch_duration = int(request.POST['scoredistribution-epoch-duration'])
    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)

    response = scoreDistributionHtml(epoch_duration, int(session_data.sampling_frequency), session_data.raw_data,
                                     scorepochs_f_range)
    return HttpResponse(response)



def exportsettings(request):
    #Fornisce all'utente la pagina di esportazione delle epoche
    template = loader.get_template('scorepochsapp/export.html')
    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)

    # json con i riferimenti dei dati da esportare, provenienti dalla gui
    session_data.export_cfg = request.POST['export-cfg']

    context = {"session_timestamp": session_timestamp}
    return HttpResponse(template.render(context, request))



def export(request):
    # Servizio destinato a non fornire un contenuto visibile all'utente
    # Avvia il download del file esportato
    export_data = request.POST['export-data']
    file_format = request.POST['file-format']
    session_timestamp = request.POST['session-timestamp']
    session_data = sessions_manager.getSession(session_timestamp)

    # JSON con le preferenze di esportazione, memorizzato dalla vista exportsettings su session_data.export_cfg
    export_r = json.loads(session_data.export_cfg)
    epochs_selected = list(export_r['epochs-selected'])

    def computeIntervals(selection_array, sampling_frequency):
        # Calcola gli intervalli di nparray corrispondenti alle epoche
        # esempio input selection_array = [0,0,1,0,0,1,1,1,...]
        # esempio output = [[0,319],[480,639],...]
        indexes = []
        i = 0
        for item in selection_array:
            if (item == 1):
                indexes.append(
                    [int(i*sampling_frequency), int((i+1)*sampling_frequency-1)])
            i += 1
        return indexes

    if export_data == 'entire file':
        intervals = [[0, session_data.samples_number-1]]
    elif export_data == 'selected epochs':
        intervals = computeIntervals(
            epochs_selected, session_data.sampling_frequency)

    if (file_format == 'csv'):
        separator = request.POST['separator']
        decimal_point = request.POST['decimal-point']
        filename = session_data.file_name
        exportCsv(filename[0:-4], session_data,
                  intervals, separator, decimal_point)

        with open(filename[0:-4]+'.csv', "rb") as f:
            file_content = f.read()
            response_filename = filename[0:-4]+'.csv'
            content_disposition = 'attachment; filename="{}"'.format(
                response_filename)

        return HttpResponse(file_content, content_type="text/csv", headers={"Content-Disposition": content_disposition},)

    if (file_format == 'edf'):
        filename = session_data.file_name
        exportEdf(filename[0:-4]+'.edf', session_data, intervals)
        with open(filename[0:-4]+'.edf', "rb") as f:
            file_content = f.read()
            response_filename = filename[0:-4]+'.edf'
            content_disposition = 'attachment; filename="{}"'.format(
                response_filename)

        return HttpResponse(file_content, content_type="application/octet-stream", headers={"Content-Disposition": content_disposition},)