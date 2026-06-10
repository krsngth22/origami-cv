import { useState, useRef, useCallback } from "react";
import PaperScene from "./components/PaperScene";
import FoldControls from "./components/FoldControls";
import ImageUpload from "./components/ImageUpload";
import StepPanel from "./components/StepPanel";
import { CRANE_STEPS, BOAT_STEPS } from "./utils/foldSequences";
import { analyzeImage } from "./api";

const TABS = [
  { id: "crane", label: "🦢 Crane" },
  { id: "boat", label: "⛵ Boat" },
  { id: "upload", label: "📤 Upload Diagram" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("crane");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const paperRef = useRef();

  const currentSteps = activeTab === "crane"
    ? CRANE_STEPS
    : activeTab === "boat"
    ? BOAT_STEPS
    : null;

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setCurrentIndex(0);
    setIsAnimating(false);
    setInstructions(null);
    setError(null);
    if (paperRef.current) paperRef.current.reset();
  }, []);

  const handleNext = useCallback(() => {
    if (!currentSteps || isAnimating) return;
    const step = currentSteps[currentIndex];
    if (!step) return;
    setIsAnimating(true);
    paperRef.current?.fold(step, () => {
      setIsAnimating(false);
      setCurrentIndex(i => Math.min(i + 1, currentSteps.length - 1));
    });
  }, [currentSteps, currentIndex, isAnimating]);

  const handleUndo = useCallback(() => {
    if (currentIndex === 0 || isAnimating) return;
    const newIndex = currentIndex - 1;
    setIsAnimating(true);
    if (paperRef.current) paperRef.current.reset();
    const stepsToReplay = currentSteps.slice(0, newIndex);
    let i = 0;
    const replayNext = () => {
      if (i >= stepsToReplay.length) {
        setCurrentIndex(newIndex);
        setIsAnimating(false);
        return;
      }
      paperRef.current?.fold(
        { ...stepsToReplay[i], duration: 0.3 },
        () => { i++; replayNext(); }
      );
    };
    replayNext();
  }, [currentIndex, isAnimating, currentSteps]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setIsAnimating(false);
    if (paperRef.current) paperRef.current.reset();
  }, []);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setInstructions(null);
    try {
      const data = await analyzeImage(file);
      if (data.status === "no_detections") {
        setError("No origami symbols detected. Try a clearer diagram.");
      } else {
        setInstructions(data.instructions);
      }
    } catch {
      setError("Failed to analyze image. Make sure the API is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Origami CV</h1>
          <p className="text-sm text-gray-400">3D folding instructions from diagrams</p>
        </div>
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex h-[calc(100vh-73px)]">
        <div className="w-80 border-r border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto">
          {activeTab === "upload" ? (
            <>
              <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
              {error && (
                <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              {instructions && (
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3">
                  <p className="text-yellow-300 text-xs">
                    Full 3D animation coming soon for uploaded diagrams.
                  </p>
                </div>
              )}
              <StepPanel
                instructions={instructions}
                currentStepIndex={0}
                onStepChange={() => {}}
                isAnimating={false}
              />
            </>
          ) : (
            <FoldControls
              steps={currentSteps}
              currentIndex={currentIndex}
              isAnimating={isAnimating}
              onNext={handleNext}
              onUndo={handleUndo}
              onReset={handleReset}
            />
          )}
        </div>

        <div className="flex-1">
          <PaperScene paperRef={paperRef} />
        </div>
      </main>
    </div>
  );
}