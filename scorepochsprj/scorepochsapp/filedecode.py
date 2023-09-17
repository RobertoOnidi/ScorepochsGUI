import mne
import numpy as np
import csv
import copy

def edfdecode(tmp_file_name,source_file_name,session_data):
    #edfdecode si occupa soltanto di decodificare le informazioni presenti nel file edf
    data = mne.io.read_raw_edf(tmp_file_name)
    raw_data = data.get_data()
    session_data.flush()
    session_data.channels_number = (np.shape(raw_data)[0])
    session_data.samples_number = (np.shape(raw_data)[1])
    session_data.sampling_frequency = data.info['sfreq']
    session_data.lowpass_frequency = data.info['lowpass']
    session_data.highpass_frequency = data.info['highpass']
    session_data.file_name = str(source_file_name)
    session_data.raw_data = raw_data
    session_data.channels_names = data.ch_names

def csvdecode(tmp_file_name,source_file_name,schema,delimiter,decimal_point,sampling_frequency, session_data):
    try:
        with open(tmp_file_name,'r+') as f:
            #se selezionato il formato decimale con la "," eseguo la conversione
            if (decimal_point == ','):
                while(True):
                    line_pos = f.tell()
                    line_content = f.readline()
                    if (line_content == ''):
                        break
                    line_content = line_content.replace(',','.')
                    f.seek(line_pos)
                    f.writelines(line_content)

            #se il csv contiene l'header, lo estraggo
            if (schema == 'header'):
                f.seek(0)
                csv_content = csv.reader(f,delimiter=delimiter)

                f.seek(0)
                csv_header = next(csv_content)

        #estraggo i dati dal csv e lo riverso in un numpy array
        if (schema == 'header'):    
            #se il csv contiene l'header, salto la prima riga skiprows=1
            # raw_data = np.loadtxt('tmp.csv', skiprows=1, delimiter=delimiter)
            raw_data = np.loadtxt(tmp_file_name, skiprows=1, delimiter=delimiter)
            raw_data = raw_data.transpose()
        else:
            # raw_data = np.loadtxt('tmp.csv', skiprows=0, delimiter=delimiter)
            raw_data = np.loadtxt(tmp_file_name, skiprows=0, delimiter=delimiter)
            
            if (schema == 'no-header-channels-rows'):
                #non devo fare nulla
                pass
            elif (schema == 'no-header-channels-columns'):
                #serve trasporre la matrice numpy array
                raw_data = raw_data.transpose()
        
        session_data.flush()
        session_data.raw_data = raw_data
        session_data.channels_number = (np.shape(raw_data)[0])
        session_data.samples_number = (np.shape(raw_data)[1])
        session_data.sampling_frequency = sampling_frequency
        session_data.file_name = source_file_name
        
        if (schema =='header'):
            session_data.channels_names = csv_header
        return 1
    except:
        return 0