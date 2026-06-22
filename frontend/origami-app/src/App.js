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
  const [paperColor, setPaperColor] = useState("#e63946");
  const [activeTab, setActiveTab] = useState("crane");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStepIndex, setUploadStepIndex] = useState(0);
  const paperRef = useRef();

  const currentSteps = activeTab === "crane"
    ? CRANE_STEPS
    : activeTab === "boat"
    ? BOAT_STEPS
    : null;

  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const handleTabChange = useCallback((tabId) => {
    if (tabId === activeTab) return;
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setCurrentIndex(0);
      setIsAnimating(false);
      setInstructions(null);
      setError(null);
      if (paperRef.current) paperRef.current.reset();
      setIsTabTransitioning(false);
    }, 200);
  }, [activeTab]);

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
    paperRef.current?.goToStep(currentSteps, newIndex, () => {
      setIsAnimating(false);
      setCurrentIndex(newIndex);
    });
  }, [currentIndex, isAnimating, currentSteps]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setIsAnimating(false);
    if (paperRef.current) paperRef.current.reset();
  }, []);

  const handleUpload = async (file) => {
    setUploadStepIndex(0);
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
      {activeTab !== "upload" && (
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs text-gray-400">Paper color</span>
          <input
            type="color"
            value={paperColor}
            onChange={e => {
              setPaperColor(e.target.value);
              handleReset();
            }}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>
      )}
      
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

      <main className="flex flex-col md:flex-row h-[calc(100vh-73px)]">
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[45vh] md:max-h-full">
          {activeTab !== "upload" && (
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-white">
                {activeTab === "crane" ? "🦢 Paper Crane" : "⛵ Paper Boat"}
              </h2>
              <p className="text-xs text-gray-500">
                {activeTab === "crane" ? "Classic 11-step origami crane" : "Classic 7-step origami boat"}
              </p>
            </div>
          )}
          {activeTab === "upload" ? (
            <>
              <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
              
              {instructions && (
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3">
                  <p className="text-yellow-300 text-xs">
                    Full 3D animation coming soon for uploaded diagrams.
                  </p>
                </div>
              )}
              <StepPanel
                instructions={instructions}
                currentStepIndex={uploadStepIndex}
                onStepChange={setUploadStepIndex}
                isAnimating={false}
                error={null}
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

        <div className={`flex-1 min-h-[55vh] md:min-h-0 transition-opacity duration-200 ${isTabTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <PaperScene
            paperRef={paperRef}
            paperColor={paperColor}
            cameraTarget={currentSteps?.[currentIndex]?.camera}
            isAnimating={isAnimating}
          />
        </div>
      </main>
    </div>
  );
}