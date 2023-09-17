from django.urls import path

from . import views

urlpatterns = [
    path('',views.index, name='index'),
    path('edfstore',views.edfstore, name='edfstore'),
    path('csvimport',views.csvimport, name='csvimport'),
    path('csvstore',views.csvstore, name='csvstore'),
    path('gui',views.gui, name='gui'),
    path('scorepochs',views.scorepochs, name='scorepochs'),
    path('scorepochsexec',views.scorepochsexec, name='scorepochsexec'),
    path('scorepochsget/<int:session_timestamp>',views.scorepochsget, name='scorepochsget'),
    path('corrmatrix',views.corrmatrix, name='corrmatrix'),
    path('psd',views.psd, name='psd'),
    path('scorevector',views.scorevector, name='scorevector'),
    path('scoredistribution',views.scoredistribution, name='scoredistribution'),
    path('datarequest',views.datarequest, name='datarequest'),
    path('dataget/<int:session_timestamp>',views.dataget, name='dataget'),
    path('exportsettings',views.exportsettings, name='exportsettings'),
    path('export',views.export, name='export'),
]