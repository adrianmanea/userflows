"use client";
import { useState } from "react";
import Link from "next/link";
import { Smartphone, Monitor } from "lucide-react";
import { PreviewFrame } from "../renderer/PreviewFrame";
import { DeviceMockup } from "../renderer/DeviceMockup";
import { FlowControls } from "./FlowControls";

interface Step {
  component?: {
    code_string: string;
    name: string;
  };
}

interface FlowViewerProps {
  steps: Step[];
}

export default function FlowViewer({ steps }: FlowViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState("mobile"); // 'mobile' | 'desktop'

  if (!steps || steps.length === 0)
    return (
      <div className="flex items-center justify-center h-screen">
        No steps found
      </div>
    );

  const currentStep = steps[currentStepIndex];
  const code = currentStep.component?.code_string || "";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-xl">
            PageInspo.com
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="text-sm text-gray-500">
            {currentStep.component?.name}
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("mobile")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "mobile"
                ? "bg-white shadow text-black"
                : "text-gray-500 hover:text-gray-900"
            }`}
            title="Mobile View"
          >
            <Smartphone size={20} />
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "desktop"
                ? "bg-white shadow text-black"
                : "text-gray-500 hover:text-gray-900"
            }`}
            title="Desktop View"
          >
            <Monitor size={20} />
          </button>
        </div>
        <div className="w-20"></div>{" "}
        {/* Spacer to balance header if needed, or actions */}
      </header>

      <main className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-gray-50/50">
        {viewMode === "mobile" ? (
          <DeviceMockup>
            <PreviewFrame code={code} />
          </DeviceMockup>
        ) : (
          <div className="w-full max-w-6xl h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* Browser Chrome (Fake) */}
            <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 text-center">
                <div className="bg-white mx-auto max-w-md text-xs py-1 rounded text-gray-400">
                  example.com
                </div>
              </div>
            </div>
            <div className="h-full">
              <PreviewFrame code={code} />
            </div>
          </div>
        )}
      </main>

      <FlowControls
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        onNext={() =>
          setCurrentStepIndex((i) => Math.min(steps.length - 1, i + 1))
        }
        onPrev={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
      />
    </div>
  );
}
