"""
Based on converter.py from https://gist.github.com/jfmlima/8f5e2a50b557c3a0345e217382c9d9d3
Adds more readability and makes it work for a single csv file
"""

import pathlib
import csv
import json
from datetime import datetime, timezone, timedelta
from typing_extensions import Annotated

import typer
import pandas as pd

app = typer.Typer()


def parse_timezone(tz_str: str) -> timezone:
    """
    Parse a timezone string like '+01:00', '-05:00', or 'UTC' into a timezone object.
    """
    if tz_str.upper() == "UTC" or tz_str == "Z":
        return timezone.utc

    # Parse format like +01:00, -05:00, +0100, -0500
    tz_str = tz_str.strip()
    if not tz_str:
        return timezone.utc

    sign = 1 if tz_str[0] == '+' else -1
    tz_str = tz_str[1:]  # Remove the sign

    if ':' in tz_str:
        hours, minutes = tz_str.split(':')
    elif len(tz_str) == 4:
        hours, minutes = tz_str[:2], tz_str[2:]
    elif len(tz_str) <= 2:
        hours, minutes = tz_str, '0'
    else:
        hours, minutes = tz_str, '0'

    offset = timedelta(hours=int(hours), minutes=int(minutes))
    return timezone(sign * offset)


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


def convert_to_hevy_format(df, tz: timezone = timezone.utc):
    with open("../NextJsApp/public/exercises.json", "r") as file:
        mapper = json.load(file)

    def format_date_with_timezone(row):
        """
        Use starttime (Unix timestamp) if available for accurate time,
        otherwise fallback to mydate. Format with the specified timezone.
        """
        try:
            if pd.notna(row.get("starttime")) and str(row["starttime"]).strip():
                # starttime is a Unix timestamp in seconds
                timestamp = int(float(row["starttime"]))
                dt = datetime.fromtimestamp(timestamp, tz=tz)
            else:
                # Fallback to mydate (just the date)
                dt = datetime.strptime(str(row["mydate"]), "%Y-%m-%d")
                dt = dt.replace(tzinfo=tz)

            # Format as ISO 8601 with timezone offset
            return dt.strftime("%Y-%m-%dT%H:%M:%S%z")
        except (ValueError, TypeError):
            # Final fallback
            return pd.to_datetime(row["mydate"]).isoformat()

    # Format timezone offset properly (insert colon: +0100 -> +01:00)
    def format_with_colon(iso_str):
        if len(iso_str) >= 5 and iso_str[-5] in ['+', '-'] and ':' not in iso_str[-5:]:
            return iso_str[:-2] + ':' + iso_str[-2:]
        return iso_str

    out = pd.DataFrame()
    out["Date"] = df.apply(format_date_with_timezone, axis=1).apply(format_with_colon)
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
    timezone_str: Annotated[
        str,
        typer.Option(
            "--timezone", "-tz", help="Timezone offset (e.g., '+01:00', '-05:00', 'UTC'). Defaults to UTC."
        ),
    ] = "UTC",
):
    tz = parse_timezone(timezone_str)
    print(f"Using timezone: {tz}")

    sections = read_input_file(input_file)
    workout_sessions_df, exercise_logs_df = create_dataframes(sections)
    merged_df = merge_dataframes(exercise_logs_df, workout_sessions_df)
    processed_df = process_logs(merged_df)
    hevy_df = convert_to_hevy_format(processed_df, tz)
    save_to_csv(hevy_df, output_file)


if __name__ == "__main__":
    app()
