# ScorepochsGUI
[Scorepochs](https://github.com/smlacava/scorepochs/tree/master/Python) is an algorithm developed by the Department of Electrical and Electronic Engineering of the University of Cagliari, which allows experts in EEG and MEG diagnostic techniques to be supported in the selection of segments (epochs) of M/EEG recordings.

It represents the attempt to create an automatic, objective procedure that guarantees the repeatability of the evaluations, indicating the epochs with the least probability of containing an artefact and therefore most suitable for the study.

It's released as both Python or Matlab scripts and is intended for CLI (Command Line Interface) usage.

# GUI
This project provides a GUI (Graphical User Interface) for Scorepochs, allowing several advantages: graphical representation of the M/EEG recording imported, user interaction with Scorepochs' parameters, multi-user usage.

The GUI is developed as a web application, and it's made up of a front end application and a backend application. Both these aspects are included in this project. Django web framework was chosen as a web server. It creates a localhost webserver, which supplies web pages to the client and executes back end calculations.

# Project Description

| Description | Screenshoot |
|-----------------------|---|
|Main GUI | ![scorepochs-gui](https://github.com/RobertoOnidi/ScorepochsGUI/assets/145294028/af24120a-aab5-4713-bf79-6c6fad4bbf09)|
|Import allows recordings in EDF and CSV format | ![scorepochs-index](https://github.com/RobertoOnidi/ScorepochsGUI/assets/145294028/beae2fa6-ccec-48bf-8796-311633b3f171)|
|CSV settings allows to import several csv configurations | ![scorepochs-csv-import-cfg](https://github.com/RobertoOnidi/ScorepochsGUI/assets/145294028/d8fada6c-35c3-452a-b3ee-d03bc1895a96)|
| GUI shows a score for each epoch and allows to highlights epochs with better scores  | ![image](https://github.com/RobertoOnidi/ScorepochsGUI/assets/145294028/7b0391be-2d73-49c1-bab0-adedb3f0bcfe)|





