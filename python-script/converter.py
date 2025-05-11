"""
Based on converter.py from https://gist.github.com/jfmlima/8f5e2a50b557c3a0345e217382c9d9d3
Adds more readability and makes it work for a single csv file
"""

import pathlib
import csv
import json
from typing_extensions import Annotated

import typer
import pandas as pd

app = typer.Typer()


def read_input_file(input_file):
    """
    Reads the input CSV file and organizes data into sections.
    """
    sections = {"WORKOUT SESSIONS": [], "EXERCISE LOGS": []}
    current_section = None

    with open(input_file, "r") as infile:
        for line in infile:
            line = line.strip()

            if "### WORKOUT SESSIONS ###" in line:
                current_section = "WORKOUT SESSIONS"
            elif "### EXERCISE LOGS ###" in line:
                current_section = "EXERCISE LOGS"
            elif not line:
                continue
            elif line.startswith("#"):
                current_section = None
            elif current_section:
                sections[current_section].append(line)

    return sections


def create_dataframes(sections):
    """
    Creates DataFrames from the organized sections.
    """
    workout_sessions_df = pd.DataFrame()
    exercise_logs_df = pd.DataFrame()

    if sections["WORKOUT SESSIONS"]:
        header, *data = sections["WORKOUT SESSIONS"]
        workout_sessions_df = pd.DataFrame(
            [row.split(",") for row in data], columns=header.split(",")
        )

    if sections["EXERCISE LOGS"]:
        header, *data = sections["EXERCISE LOGS"]
        # uses csv.reader instead for splitting by commas since some field can include commas
        header_columns = next(csv.reader([header]))
        exercise_logs_data = list(csv.reader(data))
        exercise_logs_df = pd.DataFrame(exercise_logs_data, columns=header_columns)

    print("DataFrames created successfully:")
    print("- workout_sessions_df")
    print("- exercise_logs_df")

    # make to csv
    # workout_sessions_df.to_csv('aa_workout_sessions_df.csv', index=False)
    # exercise_logs_df.to_csv('aaa_exercise_logs_df.csv', index=False)

    return workout_sessions_df, exercise_logs_df


def merge_dataframes(exercise_logs_df, workout_sessions_df):
    """
    Merges the exercise logs and workout sessions DataFrames.
    """

    if exercise_logs_df.empty:
        print("Warning: exercise_logs_df is empty.")
        return None
    elif workout_sessions_df.empty:
        print("Warning: workout_sessions_df is empty.")
        return None

    return pd.merge(
        exercise_logs_df,
        workout_sessions_df,
        left_on="belongsession",
        right_on="_id",
        how="left",
        suffixes=("-E", "-S"),
    )


def process_logs(df):
    """
    Processes the logs column to extract weights, reps, and set order.
    """
    df["logs"] = df["logs"].str.split(",")
    df = df.explode("logs")
    df[["weight", "reps"]] = df["logs"].str.split("x", expand=True)
    df["set_order"] = df.groupby("ename").cumcount() + 1
    return df


def convert_to_hevy_format(df):
    with open("../NextJsApp/public/exercises.json", "r") as file:
        mapper = json.load(file)

    out = pd.DataFrame()
    out["Date"] = pd.to_datetime(df["mydate"]).apply(lambda x: x.isoformat())
    out["Workout Name"] = '"Workout"'
    out["Duration"] = df["total_time"].map(lambda x: f"{x}s")
    out["Exercise Name"] = '"' + df["ename"] + '"'
    out["Set Order"] = df["set_order"]
    out["Weight"] = df["weight"]
    out["Reps"] = df["reps"]
    out["Distance"] = 0
    out["Seconds"] = 0
    out["Notes"] = '""'
    out["Workout Notes"] = '"Sorry🫡 Script: Imported from JeFit"'
    out["RPE"] = ""

    unique_jefit_exercises = set(e.strip('"') for e in out["Exercise Name"])
    if missing_exercises := unique_jefit_exercises - set(mapper.keys()):
        print("Warning: The following exercises are not in the mapper:")
        for exercise in missing_exercises:
            print(f"- {exercise!r}")

    out["Exercise Name"] = out["Exercise Name"].map(
        lambda x: mapper.get(x.strip('"'), x)
    )

    return out


def save_to_csv(df, filename):
    """
    Saves the DataFrame to a CSV file.
    """

    df = df.applymap(lambda x: x.strip('"') if isinstance(x, str) else x)
    df.to_csv(filename, index=False)


@app.command()
def main(
    input_file: Annotated[
        pathlib.Path,
        typer.Option(
            "--input-file", "-i", file_okay=True, dir_okay=False, help="Input (Jefit) CSV filepath"
        ),
    ] = pathlib.Path("jefit.csv"),
    output_file: Annotated[
        pathlib.Path,
        typer.Option(
            "--output-file", "-o", file_okay=True, dir_okay=False, help="Output (Hevy) CSV filepath"
        ),
    ] = pathlib.Path("Hevy.csv"),
):
    sections = read_input_file(input_file)
    workout_sessions_df, exercise_logs_df = create_dataframes(sections)
    merged_df = merge_dataframes(exercise_logs_df, workout_sessions_df)
    processed_df = process_logs(merged_df)
    hevy_df = convert_to_hevy_format(processed_df)
    save_to_csv(hevy_df, output_file)


if __name__ == "__main__":
    app()
