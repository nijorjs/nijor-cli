# Project Structure :
This File is intended to help the developers understand the significance of the different files and folders in the project. It's kind of a map for developers which helps them navigate through the code.
## bin :
The bin folder contains the file which gets executed whenever somebody uses the 'nijor' command. The file is named as cli.js

## src :
The src folder contains the files which contain the code for running individual commands and these files are imported by the cli.js in the bin folder.

## tools :
The tools folder contains 2 files : <br>
<li>compiler.js : Contains code for compilation of .nijor to .js files.</li>
<li>server.js : A simple development server for nijor apps.</li>

## templates :
It contains the boilerplate code for a new Nijor Project.