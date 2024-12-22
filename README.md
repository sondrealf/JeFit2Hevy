# JeFit2Hevy

Converter from Jefit to Hevy

Updates version from Github Gist: https://gist.github.com/jfmlima/8f5e2a50b557c3a0345e217382c9d9d3
This [Link](https://workout-converter.fly.dev/) from the Gist Repository still works, but is now outdated and does include less workouts.

### Updates after Gist Repository:
- 2024-12-12: Python script now supports a single file instead of relying on the website. + Refactoring

### Where to find the Jefit file:
- Go to [https://www.jefit.com/my-jefit/settings](https://www.jefit.com/my-jefit/settings) (Remember to login)
- Click on "Data Controls"
- Click on "Export Data"

### Hot to run python script:
**Prerequisites**: Make sure you have python3 installed on your machine and have pip installed packages in the requirements.txt file.
```bash
pip install -r requirements.txt
```

- Clone this repository
- Put the Jefit file in the same directory as the python script
- Rename the Jefit file to "jefit.csv"
- Run the following command:
```bash
python3 converter.py
```
- The script will generate a file called "Hevy.csv" with the converted workouts

### How to contribute with new/updated exercises:
- Go to the "exercises.json" file
- Add the exercise name from Jefit and the corresponding Hevy exercise name
   - Example: "Barbell Reverse Grip (Jefit)": "Barbell Curl (Hevy)" 

### Coming soon (Todos):
- Website to convert the Jefit file to Hevy (React with Client side conversion)
- Add more exercises to the conversion