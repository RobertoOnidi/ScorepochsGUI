# ScorepochsGUI
Scorepochs is an algorithm developed by the Department of Electrical and Electronic Engineering of the University of Cagliari, which allows experts in EEG and MEG diagnostic techniques to be supported in the selection of segments (epochs) of M/EEG recordings.

It represents the attempt to create an automatic, objective procedure that guarantees the repeatability of the evaluations, indicating the epochs with the least probability of containing an artefact and therefore most suitable for the study.

It's released as both Python or Matlab scripts and is intended for CLI (Command Line Interface) usage.

# GUI
This project provides a GUI (Graphical User Interface) for Scorepochs, allowing several advantages: graphical representation of the M/EEG recording imported, user interaction with Scorepochs' parameters, multi-user usage.

The GUI is developed as a web application, and it's made up of a front end application and a backend application. Both these aspects are included in this project. Django web framework was chosen as a web server. It creates a localhost webserver, which supplies web pages to the client and executes back end calculations.
