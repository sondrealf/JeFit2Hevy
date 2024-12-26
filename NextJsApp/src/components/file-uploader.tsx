"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Download, HelpCircle } from "lucide-react";
import Papa from "papaparse";
import mapper from "../../public/exercises.json";
import { FAQ } from "./faq";

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [convertedData, setConvertedData] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setConvertedData(null);
    console.log("File dropped:", acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const processLogs = (data: any[]) => {
    const exploded: any[] = [];
    data.forEach((row: any) => {
      const logs = row.logs.split(",");
      logs.forEach((log: string, index: number) => {
        const [weight, reps] = log.split("x");
        exploded.push({
          ...row,
          logs: log,
          weight: weight || "",
          reps: reps || "",
          set_order: index + 1,
        });
      });
    });
    return exploded;
  };

  const handleConvert = () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    console.log("Starting conversion for file:", file.name);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsing complete:", results);

        const rows = results.data as string[][];
        console.log("Parsed rows:", rows);

        // Parse sections
        const sections: Record<string, any[]> = {
          "WORKOUT SESSIONS": [],
          "EXERCISE LOGS": [],
        };
        let currentSection: string | null = null;

        rows.forEach((row) => {
          const line = row[0]?.trim();

          if (line.startsWith("### WORKOUT SESSIONS ###")) {
            console.log("WORKOUT SESSIONS section found");
            currentSection = "WORKOUT SESSIONS";
          } else if (line.startsWith("### EXERCISE LOGS ###")) {
            console.log("EXERCISE LOGS section found");
            currentSection = "EXERCISE LOGS";
          } else if (!line) {
          } else if (line.startsWith("#")) currentSection = null;
          else if (line && currentSection) sections[currentSection].push(row);
        });

        console.log("Organized sections:", sections);

        // Create DataFrames
        const [wsHeader, ...wsRows] = sections["WORKOUT SESSIONS"];
        const [elHeader, ...elRows] = sections["EXERCISE LOGS"];

        if (!wsHeader || !elHeader) {
          console.error("Missing headers for one or both sections");
          return;
        }

        console.log("Workout Sessions Header:", wsHeader);
        console.log("Exercise Logs Header:", elHeader);

        const workoutSessions = wsRows.map((row) =>
          wsHeader.reduce((acc: any, col: string, idx: number) => {
            acc[col] = row[idx];
            return acc;
          }, {})
        );
        const exerciseLogs = elRows.map((row) =>
          elHeader.reduce((acc: any, col: string, idx: number) => {
            acc[col] = row[idx];
            return acc;
          }, {})
        );

        console.log("Workout Sessions Data:", workoutSessions);
        console.log("Exercise Logs Data:", exerciseLogs);

        // Merge and process
        const merged = exerciseLogs.map((log) => {
          const session =
            workoutSessions.find((ws) => ws._id === log.belongsession) || {};
          return { ...log, ...session };
        });

        console.log("Merged Data:", merged);

        const processed = processLogs(merged);

        console.log("Processed Logs:", processed);

        // Convert to Hevy format
        const hevyData = processed.map((row: any) => {
          const exerciseName = row.ename.trim('"');
          const mappedExerciseName =
            mapper[exerciseName as keyof typeof mapper] || exerciseName;

          return {
            Date: new Date(row.mydate).toISOString(),
            "Workout Name": "Workout",
            Duration: `${row.total_time}s`,
            "Exercise Name": mappedExerciseName,
            "Set Order": row.set_order,
            Weight: row.weight,
            Reps: row.reps,
            Distance: 0,
            Seconds: 0,
            Notes: "",
            "Workout Notes": "Sorry🫡 Script: Imported from JeFit",
            RPE: "",
          };
        });

        console.log("Converted to Hevy format:", hevyData);

        // Convert to CSV
        const csv = Papa.unparse(hevyData);
        console.log("Final CSV:", csv);
        setConvertedData(csv);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const handleDownload = () => {
    if (!convertedData) return;

    const blob = new Blob([convertedData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Hevy.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <Card className="w-full border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <Upload size={40} className="text-gray-400" />
            {file ? (
              <p className="text-lg">
                <FileText className="inline mr-2" size={20} />
                {file.name}
              </p>
            ) : (
              <p className="text-lg">
                Drag & drop a CSV file here, or click to select a file
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <HelpCircle size={16} className="mr-1" />
            Need help?
          </button>
        </div>
        {showFAQ && <FAQ />}
        {file && !convertedData && (
          <Button
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleConvert}
          >
            Convert to Hevy
          </Button>
        )}
        {convertedData && (
          <Button
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleDownload}
          >
            <Download className="mr-2" size={20} /> Download Converted File
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
