import json
import copy
import numpy as np

# from .scorepochscfg import filters_cfg


class CsessionData():
    def __init__(self):
        self._channels_number = 0
        self._samples_number = 0
        self._sampling_frequency = 0
        self._lowpass_frequency = 0
        self._highpass_frequency = 0
        self._channels_id = []  # ['ch1_data','ch2_data', ...] univoci
        self._channels_names = []  # [Fc5, Fc3, ...] (potrebbero non essere univoci)
        self._file_name = ""
        self._raw_data = None
        self._filter_data = None
        self._idx = []
        self._scores = []
        self._scorepochs_last_request_id = 0
        self._data_last_request_id = 0
        self._normal_or_filter = False  # predef = Normal (Normal = Original)
        self._max_abs_data_value = 0.0
        self._export_cfg = []

    @property
    def scorepochs_last_request_id(self):
        return self._scorepochs_last_request_id

    @scorepochs_last_request_id.setter
    def scorepochs_last_request_id(self, scorepochs_last_request_id):
        self._scorepochs_last_request_id = scorepochs_last_request_id

    @property
    def data_last_request_id(self):
        return self._data_last_request_id

    @data_last_request_id.setter
    def data_last_request_id(self, data_last_request_id):
        self._data_last_request_id = data_last_request_id

    @property
    def session_timestamp(self):
        return self._session_timestamp

    @session_timestamp.setter
    def session_timestamp(self, session_timestamp):
        self._session_timestamp = session_timestamp

    @property
    def channels_number(self):
        return self._channels_number

    @channels_number.setter
    def channels_number(self, channels_number):
        self._channels_number = channels_number

    @property
    def samples_number(self):
        return self._samples_number

    @samples_number.setter
    def samples_number(self, samples_number):
        self._samples_number = samples_number

    @property
    def sampling_frequency(self):
        return self._sampling_frequency

    @sampling_frequency.setter
    def sampling_frequency(self, sampling_frequency):
        self._sampling_frequency = sampling_frequency

    @property
    def lowpass_frequency(self):
        return self._lowpass_frequency

    @lowpass_frequency.setter
    def lowpass_frequency(self, lowpass_frequency):
        self._lowpass_frequency = lowpass_frequency

    @property
    def highpass_frequency(self):
        return self._highpass_frequency

    @highpass_frequency.setter
    def highpass_frequency(self, highpass_frequency):
        self._highpass_frequency = highpass_frequency

    @property
    def channels_id(self):
        return self._channels_id

    @channels_id.setter
    def channels_id(self, channels_id):
        self._channels_id = channels_id

    @property
    def channels_names(self):
        return self._channels_names

    @channels_names.setter
    def channels_names(self, channels_names):
        self._channels_names = channels_names

    @property
    def file_name(self):
        return self._file_name

    @file_name.setter
    def file_name(self, file_name):
        self._file_name = file_name

    @property
    def raw_data(self):
        if self._normal_or_filter == False:
            return self._raw_data
        else:
            return self._filter_data

    @raw_data.setter
    def raw_data(self, raw_data):
        self._raw_data = raw_data
        max_data_value = np.amax(self._raw_data)
        min_data_value = np.amin(self._raw_data)
        self._max_abs_data_value = max(max_data_value, abs(min_data_value))

    @property
    def idx(self):
        return self._idx

    @idx.setter
    def idx(self, idx):
        self._idx = idx

    @property
    def scores(self):
        return self._scores

    @scores.setter
    def scores(self, scores):
        self._scores = scores

    @property
    def export_cfg(self):
        return self._export_cfg

    @export_cfg.setter
    def export_cfg(self, export_cfg):
        self._export_cfg = export_cfg

    def createJSON(self):
        # Prepara gli identificativi progressivi dei singoli canali, che costituiscono le chiavi dei corrispondenti valori costituiti
        # dai dati grezzi delle registrazioni di ciascun canale
        for k in range(1, self._channels_number+1):
            # ch1_data,ch2_data, ..., chn_data
            self._channels_id.append('ch' + str(k) + '_data')

        # Creazione dell'oggetto JSON
        json_obj = {}
        json_obj['channels_number'] = self._channels_number  # 64
        json_obj['samples_number'] = self._samples_number  # 9760
        json_obj['sampling_frequency'] = self._sampling_frequency  # 160
        json_obj['lowpass_frequency'] = self._lowpass_frequency
        json_obj['highpass_frequency'] = self._highpass_frequency
        # ch1_data, ch2_data, ..., chn_data
        json_obj['channels_id'] = self._channels_id
        json_obj['channels_names'] = self._channels_names  # Fc5., Fc3., ...
        json_obj['file_name'] = self._file_name  # S001R01.edf
        json_obj['max_abs_data_value'] = self._max_abs_data_value  # 1.5e-3

        for k in range(0, self._channels_number):
            json_obj[self._channels_id[k]] = list(
                map(self.compressJson, self.raw_data[k]))

        out_json = str(json.dumps(json_obj))

        return (out_json.replace(" ", ""))

    # Compressione della stringa rappresentante l'oggetto JSON al fine di risparmiare dati e ridurre i tempi di caricamento
    def compressJson(self, a):
        str_f = (str(a))
        len_f = len(str_f)
        str_exp = format(a, "1.1e")
        len_str_exp = len(str_exp)
        if (len_f <= len_str_exp):
            return a
        else:
            return float(str_exp)

    def flush(self):
        self._channels_number = 0
        self._samples_number = 0
        self._sampling_frequency = 0
        self._lowpass_frequency = 0
        self._highpass_frequency = 0
        self._channels_id = []
        self._channels_names = []
        self._file_name = ""
        self._raw_data = []
        self._idx = []
        self._scores = []
        self._last_request_id = 0

    def filterSet(self, value):
        if value == "Normal": # Normal corrisponde a Original dell'interfaccia grafica
            self._normal_or_filter = False
            self._filter_data = None
            # Se si riporta il filtro su Normal, dopo l'applicazione di uno o più filtri,
            # viene distrutta la copia dei dati filtrati. Questo consente di annullare l'applicazione di
            # una sequenza di filtri e ripartire da zero con l'elaborazione
        else:
            self._normal_or_filter = True

    def filterApply(self, filter_fn):
        if self._filter_data is None:
            self._filter_data = np.copy(self._raw_data)
        self._filter_data = filter_fn(self._filter_data)

    def cropApply(self, a, b):
        # a,b devono essere di tipo float, compresi tra 0 e 1, inoltre deve essere a < b
        if (type(a) is float) and (type(b) is float) and (a >= 0) and (a <= 1) and (b >= 0) and (b <= 1) and (a < b):
            nparrlen = np.shape(self._raw_data)[1]
            crop_start = int(nparrlen * a)
            crop_end = int(nparrlen * b) - 1
            self._raw_data = self._raw_data[:, crop_start:crop_end]
            if self._filter_data is not None:
                self._filter_data = self._filter_data[:, crop_start:crop_end]
            self.samples_number = np.shape(self._raw_data[1])
        else:
            return

    def deleteApply(self, a, b):
        # a,b devono essere di tipo float, compresi tra 0 e 1, inoltre deve essere a < b
        if (type(a) is float) and (type(b) is float) and (a >= 0) and (a <= 1) and (b >= 0) and (b <= 1) and (a < b):
            nparrlen = np.shape(self._raw_data)[1]
            delete_start = int(nparrlen * a)
            delete_end = int(nparrlen * b) - 1

            self._raw_data = np.delete(self._raw_data, np.s_[
                                       delete_start:delete_end], axis=1)
            if self._filter_data is not None:
                self._filter_data = np.delete(self._filter_data, np.s_[
                                              delete_start:delete_end], axis=1)
            self.samples_number = np.shape(self._raw_data[1])
        else:
            return


class CsessionsManager():
    def __init__(self):
        self._instances = {}

    def createSession(self, timestamp):
        if timestamp != '' and timestamp not in self._instances:
            instance = CsessionData()
            self._instances[timestamp] = instance
            return timestamp
        else:
            return None

    def getSession(self, timestamp):
        if timestamp in self._instances:
            return self._instances[timestamp]
        else:
            return None

    def getActiveSessions(self):
        return self._instances


sessions_manager = CsessionsManager()
