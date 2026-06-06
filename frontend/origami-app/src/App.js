import { useState } from "react";
import ImageUpload from "./components/ImageUpload";
import PaperScene from "./components/PaperScene";
import StepPanel from "./components/StepPanel";
import { analyzeImage } from "./api";

export default function App() {
  const [instructions, setInstructions] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setInstructions(null);
    setCurrentStepIndex(0);
    try {
      const data = await analyzeImage(file);
      if (data.status === "no_detections") {
        setError("No origami symbols detected. Try a clearer diagram image.");
      } else {
        setInstructions(data.instructions);
      }
    } catch (err) {
      setError("Failed to analyze image. Make sure the API is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = (newIndex) => {
    setCurrentStepIndex(newIndex);
    setIsAnimating(true);
  };

  const currentStep = instructions?.steps?.[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold text-white">Origami CV</h1>
        <p className="text-sm text-gray-400">Upload a diagram → get 3D folding instructions</p>
      </header>

      <main className="flex h-[calc(100vh-73px)]">
        <div className="w-80 border-r border-gray-800 p-4 flex flex-col gap-6 overflow-y-auto">
          <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <StepPanel
            instructions={instructions}
            currentStepIndex={currentStepIndex}
            onStepChange={handleStepChange}
            isAnimating={isAnimating}
          />
        </div>

        <div className="flex-1">
          <PaperScene
            currentStep={currentStep}
            isAnimating={isAnimating}
            onAnimationComplete={() => setIsAnimating(false)}
          />
        </div>
      </main>
    </div>
  );
}
