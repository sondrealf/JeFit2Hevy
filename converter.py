"""
Based on converter.py from https://gist.github.com/jfmlima/8f5e2a50b557c3a0345e217382c9d9d3
Adds more readability and makes it work for a single csv file
"""

import pandas as pd
import csv


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
    """
    Converts the DataFrame to Hevy's format with appropriate headers.
    """
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

    mapper = {
        '"Dumbbell Pullover"': "Pullover (Dumbbell)",
        '"T Bar Row"': "T Bar Row",
        '"Barbell Hip Thrust"': "Hip Thrust (Barbell)",
        '"Dumbbell Seated Side Lateral Raise"': "Seated Lateral Raise (Dumbbell)",
        '"Dumbbell Supine Cross Tricep Extension"': "Single Arm Tricep Extension (Dumbbell)",
        '"Dumbbell Waiter Curls"': "Hammer Curl (Dumbbell)",
        '"Cable Internal Rotation"': "Cable Internal Rotation",
        '"Cable External Rotation"': "Cable External Rotation",
        '"Machine Seated Calf Raise"': "Seated Calf Raise",
        '"Machine Single-Leg Extension "': "Single Leg Extensions",
        '"Machine Tricep Extension"': "Triceps Extension (Machine)",
        '"Dumbbell Tricep Extension"': "Triceps Extension (Dumbbell)",
        '"Dumbbell Alternating Hammer Curl"': "Hammer Curl (Dumbbell)",
        '"Barbell Squat"': "Squat (Barbell)",
        '"Dumbbell Alternating Incline Curl"': "Seated Incline Curl (Dumbbell)",
        '"Dumbbell Wrist Curl (Palms Up)"': "Seated Palms Up Wrist Curl",
        '"Cable High Pulley Tricep Extension"': "Triceps Extension (Cable)",
        '"Machine Incline Chest Press"': "Incline Chest Press (Machine)",
        '"Back Hyperextension"': "Back Extension (Weighted Hyperextension)",
        '"Machine Single-Leg Curl"': "Seated Leg Curl (Machine)",
        '"Cable One-Arm Tricep Pushdown (Reverse Grip)"': "Single Arm Triceps Pushdown (Cable)",
        '"Machine Hip Adduction"': "Hip Adduction (Machine)",
        '"Quadricep Stretch"': "Stretching",
        '"90/90 Hamstring Stretch"': "Stretching",
        '"Dumbbell One-Arm Front Raise"': "Front Raise (Dumbbell)",
        '"Barbell Bench Press"': "Bench Press (Barbell)",
        '"Dumbbell Incline Bench Press"': "Incline Bench Press (Dumbbell)",
        '"Dumbbell Bench Press"': "Bench Press (Dumbbell)",
        '"Dumbbell Incline Bench Row"': "Chest Supported Incline Row (Dumbbell)",
        '"Barbell Incline Bench Press"': "Incline Bench Press (Barbell)",
        '"Leverage Incline Chest Press"': "Incline Bench Press (Barbell)",
        '"Cable Cross-Over"': "Cable Fly Crossovers",
        '"EZ Bar Curl"': "EZ Bar Biceps Curl",
        '"Cable Rope Triceps Pushdown"': "Triceps Rope Pushdown",
        '"Dumbbell Concentration Curl"': "Concentration Curl",
        '"Dumbbell Spider Curl"': "Spider Curl (Dumbbell)",
        '"Barbell Seated Tricep Extension"': "Triceps Extension (Barbell)",
        '"Cable Reverse Grip Tricep Kickback"': "Triceps Kickback (Cable)",
        '"Barbell Bent-Over Row"': "Bent Over Row (Barbell)",
        '"Weighted Pull-Up"': "Pull Up (Weighted)",
        '"Barbell Upright Row"': "Upright Row (Barbell)",
        '"Dip"': "Triceps Dip",
        '"Dumbbell Seated Shoulder Press"': "Shoulder Press (Dumbbell)",
        '"EZ Bar Tricep Extension"': "Triceps Extension (Barbell)",
        '"Barbell Deep Squat"': "Squat (Barbell)",
        '"Barbell Deadlift"': "Deadlift (Barbell)",
        '"Barbell Stiff-Leg Deadlift"': "Straight Leg Deadlift",
        '"Leg Press"': "Leg Press (Machine)",
        '"Seated Leg Curl"': "Seated Leg Curl (Machine)",
        '"Leg Extension"': "Leg Extension (Machine)",
        '"Standing Calf Raise"': "Seated Calf Raise",
        '"Sit-Up"': "Sit Up",
        '"Pull-Up"': "Pull Up",
        '"Cable Seated Row"': "Seated Cable Row - V Grip (Cable)",
        '"Close Grip Front Lat Pulldown"': "Lat Pulldown - Close Grip (Cable)",
        '"Cable Rope Face Pull"': "Face Pull",
        '"Dumbbell One-Arm Row"': "Dumbbell Row",
        '"Dumbbell Lateral Raise"': "Lateral Raise (Dumbbell)",
        '"Barbell Front Squat"': "Front Squat",
        '"Barbell Romanian Deadlift"': "Romanian Deadlift (Barbell)",
        '"Machine Leg Extension"': "Leg Extension (Machine)",
        '"Machine Leg Press"': "Leg Press (Machine)",
        '"Machine Seated Leg Curl"': "Seated Leg Curl (Machine)",
        '"Machine Calf Raise"': "Calf Press (Machine)",
        '"Cable Front Lat Pulldown (Close Grip)"': '"Lat Pulldown - Close Grip (Cable)',
        '"Cable Rope Tricep Pushdown"': "Triceps Rope Pushdown",
        '"Cable Tricep Kickback (Reverse Grip)"': "Triceps Kickback (Cable)",
        '"Dumbbell Incline Fly"': "Incline Chest Fly (Dumbbell)",
        '"Barbell Preacher Curl"': "Preacher Curl (Barbell)",
        '"Cable Lat Pulldown (Wide Grip)"': "Lat Pulldown (Cable)",
        '"Hack Squat"': "Hack Squat",
        '"Machine Leg Curl"': "Seated Leg Curl (Machine)",
        '"Barbell Standing Calf Raise"': "Standing Calf Raise (Barbell)",
        '"Barbell Seated Calf Raise"': "Seated Calf Raise",
        '"Donkey Calf Raise"': "Seated Calf Raise",
        '"Machine Leg Curl (Prone)"': "Seated Leg Curl (Machine)",
        '"Machine Bench Press"': "Bench Press (Barbell)",
        '"Push-Up"': "Push Up",
        '"Resistance Band Row"': "Bent Over Row (Band)",
        '"Plank"': "Plank",
        '"Band Bicep Curl "': "Bicep Curl (Suspension)",
        '"Crunch"': "Crunch",
        '"Cable Tricep Pushdown (Rope)"': "Triceps Rope Pushdown",
    }

    out["Exercise Name"] = out["Exercise Name"].map(lambda x: mapper.get(x, x))

    return out


def save_to_csv(df, filename):
    """
    Saves the DataFrame to a CSV file.
    """

    df = df.applymap(lambda x: x.strip('"') if isinstance(x, str) else x)
    df.to_csv(filename, index=False)


def main(input_file, output_file):
    sections = read_input_file(input_file)
    workout_sessions_df, exercise_logs_df = create_dataframes(sections)
    merged_df = merge_dataframes(exercise_logs_df, workout_sessions_df)
    processed_df = process_logs(merged_df)
    hevy_df = convert_to_hevy_format(processed_df)
    save_to_csv(hevy_df, output_file)


if __name__ == "__main__":
    input_file = "jefit.csv"
    output_file = "./Hevy.csv"
    main(input_file, output_file)
