"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  title: string;
  content: string;
}

const faqItems: FAQItem[] = [
  {
    title: "Can't find your JEFIT CSV file?",
    content: `
      1. Go to <a href="https://www.jefit.com/my-jefit/settings" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">https://www.jefit.com/my-jefit/settings</a> (Ensure you're logged in)
      2. Navigate to "Data Controls"
      3. Click on "Export Data"
    `,
  },
  {
    title: "Where to import the converted CSV file?",
    content: `
      In the Hevy app:
      1. Go to Profile
      2. Select "Export & Import Data"
      3. Choose "Import Data"
      4. Select the converted CSV file
    `,
  },
  {
    title: "Missing exercises in the converted file?",
    content: `
        This is a open-source project, and the conversion process is not perfect.
        If you want to contribute, you can find the source code on 
        <a href="https://github.com/sondrealf/JeFit2Hevy" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">GitHub</a>.
        In this repository, you can just find the JSON file with the exercises in
        - <a href="https://github.com/sondrealf/JeFit2Hevy/blob/main/NextJsApp/public/exercises.json" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">./NextJsApp/public/exercises.json</a>
        Feel free to add exercises to this file and create a pull request.
    `,
  },
  {
    title: "Other issues?",
    content: `
        If you encounter any issues, please create an issue on GitHub.
    `,
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold mb-2">Frequently Asked Questions</h3>
      <div className="space-y-2">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              className="w-full text-left p-4 flex justify-between items-center bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => toggleItem(index)}
            >
              <span>{item.title}</span>
              {openIndex === index ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 bg-gray-800/30">
                <p
                  className="text-gray-300 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
