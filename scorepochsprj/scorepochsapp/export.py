import mne
import numpy as np
import csv
import copy


def intervalsToIndexes(intervalArray):
    idxs = []
    for interval in intervalArray:
        a = interval[0]
        b = interval[1]
        idxs += list(np.r_[a:b+1])
    return idxs



def exportEdf(filename, data, intervals):
    idxs = intervalsToIndexes(intervals)
    out_data = copy.deepcopy(data)
    out_data_selected = out_data.raw_data[:, idxs]
    ch_types = ['eeg']*int(out_data.channels_number)
    channels_names = out_data.channels_names
    out_info = mne.create_info(
        ch_names=channels_names, ch_types=ch_types, sfreq=out_data.sampling_frequency)
    raw_array = mne.io.RawArray(
        data=out_data_selected, info=out_info, first_samp=0, copy='auto', verbose=None)
    raw_array.export(fname=filename, fmt='edf', physical_range='auto',
                     add_ch_type=False, overwrite=True, verbose=None)



def exportCsv(filename, data, intervals, separator, decimal_point):
    header = data.channels_names
    tmp_data = copy.deepcopy(data)
    out_data = np.transpose(tmp_data.raw_data)
    idxs = intervalsToIndexes(intervals)
    out_data_selected = out_data[idxs, :]

    with open(filename + '.csv', 'w', newline='') as csvfile:
        csv_obj = csv.writer(csvfile, delimiter=separator)
        csv_obj.writerow(header)  # Write the header

        for i in range(0, np.shape(out_data_selected)[0]):
            csv_obj.writerow(list(out_data_selected[i]))
