import os.path
import numpy as np
from plotly.graph_objects import Scatter, Figure, Heatmap, Histogram
from plotly.subplots import make_subplots
from plotly.colors import DEFAULT_PLOTLY_COLORS
from scipy import signal as sig
from scipy import stats as st
from .scorepochs import _spectrum_parameters,scorEpochs

def powerSpectrumByEpochsToHTML(time_dimension_epochs, frequency, Yarray, channels_selected_ids, epochs_selected_ids):
    epLen = int(time_dimension_epochs * frequency) #numero di campioni di una epoca
    dataLen = len(Yarray[0]) #numero di campioni di una traccia della registrazione
    k = 1
    idx_ep = []
    while(True):
        x = (k-1)*epLen
        y = k*epLen-1
        if (k*epLen-1) > dataLen:
            break
        else:
            idx_ep.append([x,y])
            k += 1
    
    #Preparo i titoli degli subplot
    titles = []
    for epoch_selected in epochs_selected_ids:
        titles.append('epoch: {}'.format(epoch_selected))

    fig = make_subplots(rows=len(epochs_selected_ids), cols=1, subplot_titles=titles)

    name_html_file = 'update_figure.html'

    rows = 1
    row_height = 300

    for epoch_selected in epochs_selected_ids:
        for channel_selected in channels_selected_ids:    
            epoch = Yarray[channel_selected-1][idx_ep[epoch_selected-1][0]:idx_ep[epoch_selected-1][1]]
            # compute power spectrum
            f, aux_pxx = sig.welch(epoch.T, fs=frequency, window='hamming', nperseg=round(epLen / 8), detrend=False)
            fig_name = 'channel: {}'.format(channel_selected)
            fig.add_trace(Scatter(x=f, y=aux_pxx, mode='lines', name=fig_name), row=rows, col=1)
        rows = rows + 1
    
    fig.update_xaxes(type="log")
    fig.update_layout(showlegend=False, title_text="Power Spectrum Density sorted by Epochs")
    fig.update_layout(height=row_height*rows, width=800)

    fig.write_html(name_html_file)
    f = open(name_html_file,"rb")
    html = f.read()
    f.close()
    os.remove(name_html_file)
    return html

def powerSpectrumByChannelsToHTML(time_dimension_epochs, frequency, Yarray, channels_selected_ids, epochs_selected_ids):
    epLen = int(time_dimension_epochs * frequency) #numero di campioni di una epoca
    dataLen = len(Yarray[0]) #numero di campioni di una traccia della registrazione
    k = 1
    idx_ep = []
    while(True):
        x = (k-1)*epLen
        y = k*epLen-1
        if (k*epLen-1) > dataLen:
            break
        else:
            idx_ep.append([x,y])
            k += 1

    #Preparo i titoli degli subplot
    titles = []
    for channel_selected in channels_selected_ids:
        titles.append('channel: {}'.format(channel_selected))

    fig = make_subplots(rows=len(channels_selected_ids), cols=1, subplot_titles=titles)

    name_html_file = 'update_figure.html'

    rows = 1
    row_height = 300

    for channel_selected in channels_selected_ids:
        for epoch_selected in epochs_selected_ids:
            epoch = Yarray[channel_selected-1][idx_ep[epoch_selected-1][0]:idx_ep[epoch_selected-1][1]]
            # compute power spectrum
            f, aux_pxx = sig.welch(epoch.T, fs=frequency, window='hamming', nperseg=round(epLen / 8), detrend=False)
            fig_name = 'epoch: {}'.format(epoch_selected)
            fig.add_trace(Scatter(x=f, y=aux_pxx, mode='lines', name=fig_name), row=rows, col=1)
        rows = rows + 1
    
    fig.update_xaxes(type="log")
    fig.update_layout(showlegend=False, title_text="Power Spectrum Density sorted by Channels")
    fig.update_layout(height=row_height*rows, width=800)

    fig.write_html(name_html_file)
    f = open(name_html_file,"rb")
    html = f.read()
    f.close()
    os.remove(name_html_file)
    return html

def Corr_matrix_html(time_dimension_epochs, frequency, y_array, freq_range):
        data = []
        ep_name = []
        name_html_file = 'update_figure.html'
        epLen = round(time_dimension_epochs * frequency)
        dataLen = len(y_array[0])
        nCh = len(y_array)
        idx_ep = range(0, int(dataLen - epLen + 1), int(epLen + 1))
        nEp = len(idx_ep)
        epoch = np.zeros((nEp, nCh, epLen))
         
        for e in range(nEp):
            for c in range(nCh):
                epoch[e][c][0:epLen] = y_array[c][idx_ep[e]:idx_ep[e] + epLen]
                f, aux_pxx = sig.welch(epoch[e][c].T, fs=frequency, window='hamming', nperseg=round(epLen / 8),
                                       detrend=False)
                if c == 0 and e == 0:  # The various parameters are obtained in the first interation
                    pxx, idx_min, idx_max, nFreq = _spectrum_parameters(f, freq_range, aux_pxx, nEp, nCh)
                pxx[e][c] = aux_pxx[idx_min:idx_max + 1]
            ep_name.append('E%d' % (e + 1))
        pxxXch = np.zeros((nEp, idx_max - idx_min + 1))
        for c in range(nCh):
            for e in range(nEp):
                pxxXch[e] = pxx[e][c]
            score_ch, p = st.spearmanr(pxxXch, axis=1)
            data.append(score_ch)
        fig = Figure()
        fig.add_trace(Heatmap(x=ep_name, y=ep_name[::-1], z=data[0][::-1], showscale=True, zmin=0,
                              zmax=1,colorscale='Viridis',
                              hovertemplate="<br>".join(["x: %{x}","y: %{y}","Score: %{z}<extra></extra>"])))
        fig.update_layout(autosize=False, width=1080, height=560, title = 'Correlation Matrix:', yaxis_scaleanchor="x")
        fig.update_layout(
            updatemenus=[
                {
                    "buttons": [
                        {
                            "label": "channel %d" % (c+1),
                            "method": "update",
                            "args": [{"z": [data[c][::-1]]}]
                        }
                        for c in range(len(data))
                    ],
                    "x": 0.28,
                    "y": 1.18,
                }
            ]
        )
        fig['layout']['xaxis']['constrain'] = 'domain'
        fig.write_html(name_html_file)
        f = open(name_html_file,"rb")
        html = f.read()
        f.close()
        os.remove(name_html_file)
        return html

def scoreVectorHtml(time_dimension_epochs,frequency,y_array,freq_range,ch_names):
    name_html_file = 'update_figure.html'
    ep_name = []
    hover_text = []

    epoch_width = 10

    idx_best, epoch, scores, scoreVector = scorEpochs({'freqRange': freq_range,'fs': frequency,'windowL': time_dimension_epochs}, y_array)

    for i in range(len(scoreVector)):
        hover_text.append([])
        for j in range(len(scoreVector[0])):
            hover_text[-1].append('Epoch: {}<br />Score: {}<br />Max value: {}<br />Min value: {}'.format((j + 1),
                                            scoreVector[i][j],np.amax(scoreVector[i]), np.amin(scoreVector[i])))
            if i == 0:
                ep_name.append('E%d' % (j + 1))
    fig = make_subplots(16, 4, subplot_titles=[ch_name for i, ch_name in enumerate(ch_names)])
    channel = 0
    for i in range(int(len(ch_names)/4)):
        for j in range(4):
            if (j+(i*4)) <= len(ch_names):
                fig.add_trace(Heatmap(x= ep_name, z=[scoreVector[channel]], showscale=True, zmin=0, zmax=1,
                            colorscale='Viridis', hoverinfo = 'text', text=[hover_text[j+(4*i)]], xgap = 2),
                            i + 1, j + 1)
            channel = channel + 1
    fig.update_annotations(font_size=9)
    fig.update_xaxes(showticklabels=False)
    fig.update_yaxes(showticklabels=False)
    fig.update_layout(autosize=False, width=2000, height=700)
    fig.write_html(name_html_file)

    with open(name_html_file,"rb") as f:
        html = f.read()
    os.remove(name_html_file)
    return html

def scoreDistributionHtml(time_dimension_epochs,frequency,y_array,freq_range):
    name_html_file = 'update_figure.html'
    ep_name = []

    idx_best, epoch, scores, score_vector = scorEpochs({'freqRange': freq_range,'fs': frequency,'windowL': time_dimension_epochs}, y_array)

    for k in range(len(scores)):
        ep_name.append('E%d' % (k + 1))
        fig = make_subplots(3, 4, specs=[[{'colspan': 4}, None, None, None],
                                         [{}, {'colspan': 2, 'rowspan': 2}, None, {}],
                                         [{}, None, None, {}]],
                            subplot_titles=['Scorepochs result:', None, 'Score distribution graph:'])
        fig.add_trace(Heatmap(x=ep_name, z=[scores], showscale=True, zmin=0, zmax=1, colorscale='Viridis', xgap=3,
                              hovertemplate="<br>".join(["%{x}", "Score: %{z}<extra></extra>"])))
        fig.add_trace(Histogram(x=scores, xbins=dict(size=0.005), hovertemplate="<br>".join([
            "Interval: %{x}",
            "Count: %{y}<extra></extra>",
        ])), 2, 2)
    fig.update_yaxes(showticklabels=False)
    fig.update_layout(autosize=False, width=1080, height=565)
    fig.write_html(name_html_file)
    with open(name_html_file,"rb") as f:
        html = f.read()
    os.remove(name_html_file)
    return html