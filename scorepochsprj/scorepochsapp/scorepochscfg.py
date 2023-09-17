# File di configurazione

# Range di frequenza per il calcolo della PSD nella forma
# [fmin,fmax], f in Hz (numero intero)
scorepochs_f_range = [1, 40]



# Definizione delle funzioni di filtro

#Il filtro Original deve essere sempre presente, e la sua implementazione deve rimanere immutata
def fnOriginal(data):
    return data*1


# Definizione delle funzioni utente
# Questa funzione moltiplica ciascun elemento del dato Numpy per il valore 1.5
def fn1_5x(data):
    return data*1.5

# Questa funzione moltiplica ciascun elemento del dato Numpy per il valore -1
def fnInvert(data):
    return data*(-1)

# Configurazione dei filtri visibili nella gui
# Aggiungere alla lista filters_cfg una tupla per ogni filtro definito. Il filtro Original dovra essere sempre presente con questo nome
# (la sua implementazione non deve essere alterata)
# Ogni tupla contiene: nome del filtro (stringa), riferimento alla funzione
# La funzione deve accettare un tipo di dato Numpy, di dimensioni nxm (n = numero dei canali, m = numero dei campioni per canale)
# L'elaborazione della variabile passata come argomento deve seguire le regole valide per il tipo di dato Numpy
# Nota: Numpy può ricorrere ad operatori matematici speciali definiti "element wise".
# Fare riferimento alla documentazione disponibile su https://numpy.org/doc/stable/reference/routines.math.html

filters_cfg = [("Original",fnOriginal),("1.5 x",fn1_5x),("Invert",fnInvert)]