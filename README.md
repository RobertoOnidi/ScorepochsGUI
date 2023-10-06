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
| Scorepochs GUI Introduction | <div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/871738632?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Scorepochs GUI Introduction"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script> |





