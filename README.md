# JeFit2Hevy

Converter from Jefit to Hevy

### 🌟: Link to Jefit Hevy converter: [LINK](https://jefit2hevy.vercel.app/)

Updates version from Github Gist: https://gist.github.com/jfmlima/8f5e2a50b557c3a0345e217382c9d9d3
This [Link](https://workout-converter.fly.dev/) from the Gist Repository still works, but is now outdated and does include less workouts.

### Updates after Gist Repository:
- 2024-12-22: Python script now supports a single file instead of relying on the website. + Refactoring
- 2024-12-23: Added more exercises to the conversion
- 2024-12-26: Added a NextJs App to convert the Jefit file to Hevy
- 2025-05-05: Refactor python script to use Typer

### Where to find the Jefit file:
- Go to [https://www.jefit.com/my-jefit/settings](https://www.jefit.com/my-jefit/settings) (Remember to login)
- Click on "Data Controls"
- Click on "Export Data"

### How to contribute with new/updated exercises:
Note: Every contribution will have to be approved by the repository owner through a pull request.
- Go to the "exercises.json" file found in **NextJsApp/public/exercises.json**
- Add the exercise name from Jefit and the corresponding Hevy exercise name
   - Example: "Barbell Reverse Grip (Jefit)": "Barbell Curl (Hevy)" 
   - Feel free to add custom names also.

### How to run python script (inside python-script folder):
**Prerequisites**: Make sure you have python3 installed on your machine and have pip installed packages in the pyproject.toml file.
```bash
pip install .
```

- Clone this repository
- Have a Jefit CSV file ready
- Run the following command:
  ```bash
  python3 converter.py -i PATH_TO_YOUR_JEFIT_FILE.csv
  ```
  For example, for a file called `jefit.csv` in the same folder:
  ```bash
  python3 converter.py -i jefit.csv
  ```
- The script will generate a file called "Hevy.csv" with the converted workouts

### Todos:
- Add more exercises to the conversion
