"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Download,
  HelpCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Papa from "papaparse";
import mapper from "../../public/exercises.json";
import { FAQ } from "./faq";
import { PaymentComponent } from "./payment";
import crypto from "crypto";

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [convertedData, setConvertedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [age, setAge] = useState<string | undefined>(undefined);
  const [isBypassEnabled, setIsBypassEnabled] = useState(false);
  const ANIMATION_DURATION = 1000; // 1 seconds total duration
  const ANIMATION_STEPS = {
    PARSING: 20,
    SECTIONS: 40,
    HEADERS: 60,
    PROCESSING: 80,
    COMPLETE: 100,
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const animateProgress = async (
    start: number,
    end: number,
    duration: number
  ) => {
    const steps = 20; // Number of steps in the animation
    const stepDuration = duration / steps;
    const increment = (end - start) / steps;

    for (let i = 0; i <= steps; i++) {
      setProgress(Math.round(start + increment * i));
      await sleep(stepDuration);
    }
  };

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
      setError("No file selected");
      return;
    }

    setError(null);
    setIsConverting(true);
    setProgress(0);
    console.log("Starting conversion for file:", file.name);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log("Parsing complete:", results);

          const rows = results.data as string[][];
          console.log("Parsed rows:", rows);

          // Start the progress animation
          animateProgress(0, ANIMATION_STEPS.PARSING, ANIMATION_DURATION * 0.2);

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

          await animateProgress(
            ANIMATION_STEPS.PARSING,
            ANIMATION_STEPS.SECTIONS,
            ANIMATION_DURATION * 0.2
          );
          console.log("Organized sections:", sections);

          // Create DataFrames
          const [wsHeader, ...wsRows] = sections["WORKOUT SESSIONS"];
          const [elHeader, ...elRows] = sections["EXERCISE LOGS"];

          if (!wsHeader || !elHeader) {
            throw new Error(
              "Missing headers for one or both sections, re-upload the file and try again. Else you can check the FAQ section below or contact me"
            );
          }

          await animateProgress(
            ANIMATION_STEPS.SECTIONS,
            ANIMATION_STEPS.HEADERS,
            ANIMATION_DURATION * 0.2
          );
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

          await animateProgress(
            ANIMATION_STEPS.HEADERS,
            ANIMATION_STEPS.PROCESSING,
            ANIMATION_DURATION * 0.2
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

          // Check for oldest date
          const oldestDate = new Date(
            Math.min(...processed.map((row) => new Date(row.mydate).getTime()))
          );

          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          if (oldestDate < oneYearAgo) {
            setAge("1");
          }

          const twoYearsAgo = new Date();
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

          if (oldestDate < twoYearsAgo) {
            setAge("2");
          }

          const threeYearsAgo = new Date();
          threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

          if (oldestDate < threeYearsAgo) {
            setAge("3");
          }

          const fourYearsAgo = new Date();
          fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

          if (oldestDate < fourYearsAgo) {
            setAge("4");
          }

          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

          if (oldestDate < fiveYearsAgo) {
            setAge("5");
          }

          if (oldestDate < oneYearAgo && !isBypassEnabled) {
            setIsConverting(false);
            setShowPayment(true);
            return;
          }

          // Convert to Hevy format
          const hevyData = processed.map((row: any) => {
            const exerciseName = row.ename.trim('"');
            const mappedExerciseName =
              mapper[exerciseName as keyof typeof mapper] || exerciseName;

            return {
              Date: new Date(row.mydate).toISOString(),
              "Workout Name": `Workout ${
                isBypassEnabled ? "" : "from jefit2hevy.vercel.app"
              }`,
              Duration: `${row.total_time ?? "0"}s`,
              "Exercise Name": mappedExerciseName,
              "Set Order": row.set_order,
              Weight: row.weight,
              Reps: row.reps,
              Distance: 0,
              Seconds: 0,
              Notes: "",
              "Workout Notes": `Script: Imported from JeFit ${
                isBypassEnabled ? "" : ", Link: https://jefit2hevy.vercel.app/"
              }`,
              RPE: "",
            };
          });

          console.log("Converted to Hevy format:", hevyData);

          // Convert to CSV
          const csv = Papa.unparse(hevyData);
          console.log("Final CSV:", csv);

          await animateProgress(
            ANIMATION_STEPS.PROCESSING,
            ANIMATION_STEPS.COMPLETE,
            ANIMATION_DURATION * 0.2
          );
          setIsConverting(false);
          setConvertedData(csv);
        } catch (err) {
          console.error("Error during conversion:", err);
          setError(
            err instanceof Error
              ? err.message
              : "An error occurred during conversion"
          );
          setIsConverting(false);
          setProgress(0);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setError(
          "Failed to parse CSV file. Please make sure it's a valid JeFit export."
        );
        setIsConverting(false);
        setProgress(0);
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

  useEffect(() => {
    const checkEncryption = () => {
      const encryptionKey = "ciciciakkakaskdkasd";

      // Get dates for the past week
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      });

      // Check if any of the past week's encrypted dates are in the URL
      return dates.some((date) => {
        const encryptedDate = crypto
          .createHmac("sha256", encryptionKey)
          .update(date)
          .digest("hex");
        return window.location.href.includes(encryptedDate);
      });
    };

    setIsBypassEnabled(checkEncryption());
  }, []);

  return (
    <Card className="w-full border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        {showPayment ? (
          <PaymentComponent setShowPayment={setShowPayment} age={age} />
        ) : (
          <>
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
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {error}
              </div>
            )}
            {isBypassEnabled && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Purchase confirmed successfully! You can now convert your file.
                Do not forget to download it after conversion.
              </div>
            )}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowFAQ(!showFAQ)}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 flex items-center justify-center mx-auto"
              >
                <HelpCircle size={16} className="mr-1" />
                Need help? / FAQ
              </button>
            </div>
            {showFAQ && <FAQ />}
            {file && !convertedData && (
              <>
                <Button
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {isConverting ? "Converting..." : "Convert to Hevy"}
                </Button>
                {isConverting && (
                  <div className="mt-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-400 mt-2 text-center">
                      Converting... {progress}%
                    </p>
                  </div>
                )}
              </>
            )}
            {convertedData && (
              <>
                <Button
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleDownload}
                >
                  <Download className="mr-2" size={20} /> Download Converted
                  File
                </Button>
                {!isBypassEnabled && (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full mt-2 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    Want to remove watermark?
                  </button>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
