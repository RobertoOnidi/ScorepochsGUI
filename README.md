# ScorepochsGUI
[Scorepochs](https://github.com/smlacava/scorepochs/tree/master/Python) is an algorithm developed by the Department of Electrical and Electronic Engineering of the University of Cagliari, which allows experts in EEG and MEG diagnostic techniques to be supported in the selection of segments (epochs) of M/EEG recordings.

It represents the attempt to create an automatic, objective procedure that guarantees the repeatability of the evaluations, indicating the epochs with the least probability of containing an artefact and therefore most suitable for the study.

It's released as both Python or Matlab scripts and is intended for CLI (Command Line Interface) usage.

# GUI
This project provides a GUI (Graphical User Interface) for Scorepochs, allowing several advantages: graphical representation of the M/EEG recording imported, user interaction with Scorepochs' parameters, multi-user usage.

The GUI is developed as a web application, and it's made up of a front end application and a backend application. Both these aspects are included in this project. Django web framework was chosen as a web server. It creates a localhost webserver, which supplies web pages to the client and executes back end calculations.

# Project Description

Here is a screenshot of the main view of the Scorepochs' GUI.

![scorepochs-gui](https://github.com/RobertoOnidi/ScorepochsGUI/assets/145294028/af24120a-aab5-4713-bf79-6c6fad4bbf09)

[Here is a brief Scorepochs GUI Introduction video](https://vimeo.com/871738632)

# Django Project Installation
This project is delivered in the form of a Django Project. The following instructions describe how to setup the Django project into a local web server accessible from localhost in a Windows OS machine, assuming you have the administration rights.

Prerequisite:
A Python installation. Python version 3.11 has been used for developing this project. The following commands must be applied in the same sequence as described. 

1. Change to the root folder
   **cd C:\ **

2. Check your Python installation    
   **python -V**    
   Python 3.11.3
   (In this case Python 3.11.3 has been installed)

3. Upgrade pip (package installer for Python)    
   **python -m pip install --upgrade pip**

4. Create a folder named "scorepochs" in root directory C:\. This will contain the Django project    
   **mkdir scorepochs**

5. Change the current folder    
   **cd scorepochs**

6. Create a Venv (Virtual Environment) named "venv"    
   **python -m venv venv**

7. Activate the Venv    
   **venv\Scripts\activate**
   The activation of the Venv is highlighted by prompt change as follow:    
   (venv) C:\scorepochs>

8. Install Django    
   **pip install django**

9. Install the others package required by the project    
   **pip install mne**    
   **pip install plotly**    
   **pip install EDFlib-Python**        

10. Create the Django project    
    **django-admin startproject scorepochsprj**

11. Create the Django App    
    Change the current folder to Django project's folder (in which it should be manage.py)    
    **cd scorepochsprj**
    
    Create the app named "scorepochsapp"    
    **python manage.py startapp scorepochsapp**
    
12. Download the Django Project from this repository as zip file

13. Unzip the downloaded file, then open the inner folders until you see the "scorepochs" folder as follow
    ![image](https://github.com/RobertoOnidi/ScorepochsGUI/assets/145294028/e579982a-70d1-424e-b8a2-5eefe609e745)

    Copy this folder and overwrite the c:\scorepochs\scorepochsprj folder, answering yes to overwrite every file too.

14. The entire folder tree should now be appear as follow (some minor files has been omitted)

    ![image](https://github.com/RobertoOnidi/ScorepochsGUI/assets/145294028/673fa2e7-ccf3-4e02-bd95-fac682052a26)

15. Start the web server    
    Activate the Venv if not already activated (steps no. 5 and 7)    

    Change the current folder    
    **cd C:\scorepochs\scorepochsprj**    

    Start the web server    
    **python manage.py runserver**

16. Open a new window in a web browser, and go to http://127.0.0.1:8000/scorepochsapp
