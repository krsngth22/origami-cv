export default function StepPanel({ instructions, currentStepIndex, onStepChange, isAnimating, error }) {
  if (error) return (
    <div className="flex flex-col gap-3">
      <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-red-300 text-sm font-medium mb-1">Analysis failed</p>
        <p className="text-red-400/80 text-xs">{error}</p>
      </div>
      <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4">
        <p className="text-gray-400 text-xs font-medium mb-2">Troubleshooting tips</p>
        <ul className="text-gray-500 text-xs flex flex-col gap-1">
          <li>• Make sure the local API server is running</li>
          <li>• Try a cleaner, higher-contrast diagram image</li>
          <li>• Ensure the image shows clear fold arrows</li>
          <li>• Check your internet connection</li>
        </ul>
      </div>
    </div>
  );

  if (!instructions) return (
    <div className="flex flex-col gap-4 items-center py-8 text-center">
      <div className="text-4xl">📐</div>
      <div>
        <p className="text-gray-400 text-sm font-medium">Upload an origami diagram</p>
        <p className="text-gray-600 text-xs mt-1">The AI will detect fold symbols and generate step-by-step instructions</p>
      </div>
      <div className="w-full bg-gray-800/50 border border-gray-700/40 rounded-xl p-3 text-left">
        <p className="text-gray-500 text-xs font-medium mb-2">Best results with:</p>
        <ul className="text-gray-600 text-xs flex flex-col gap-1">
          <li>✓ Clear black-and-white diagrams</li>
          <li>✓ Single step or simple multi-step diagrams</li>
          <li>✓ High contrast arrows and fold lines</li>
          <li>✓ PNG or JPG format</li>
        </ul>
      </div>
    </div>
  );

  const steps = instructions.steps || [];
  const currentStep = steps[currentStepIndex];

  if (steps.length === 0) return (
    <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4">
      <p className="text-yellow-300 text-sm font-medium mb-1">No steps generated</p>
      <p className="text-yellow-400/80 text-xs">The diagram was analyzed but no fold steps were returned. Try a different image.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {instructions.difficulty} · {steps.length} steps
        </span>
        <span className="text-xs text-gray-400">
          {currentStepIndex + 1} / {steps.length}
        </span>
      </div>

      {currentStep && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              Step {currentStep.step_number}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentStep.fold_type === 'valley-fold'
                ? 'text-blue-300 bg-blue-900/40'
                : currentStep.fold_type === 'mountain-fold'
                ? 'text-red-300 bg-red-900/40'
                : currentStep.fold_type === 'fold-unfold'
                ? 'text-yellow-300 bg-yellow-900/40'
                : currentStep.fold_type === 'turn-over'
                ? 'text-purple-300 bg-purple-900/40'
                : 'text-gray-300 bg-gray-700/40'
            }`}>
              {currentStep.fold_type}
            </span>
          </div>
          <p className="text-white font-medium mb-2">{currentStep.instruction}</p>
          {currentStep.explanation && (
            <p className="text-gray-400 text-sm">{currentStep.explanation}</p>
          )}
          {currentStep.position && (
            <p className="text-gray-500 text-xs mt-2">📍 {currentStep.position}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0 || isAnimating}
          className="flex-1 py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition-all"
        >
          ← Previous
        </button>
        <button
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
          disabled={currentStepIndex === steps.length - 1 || isAnimating}
          className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition-all"
        >
          Next →
        </button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => onStepChange(i)}
            className={`w-6 h-6 rounded-full text-xs transition-all
              ${i === currentStepIndex
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {instructions.notes && (
        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3">
          <p className="text-yellow-300 text-xs">{instructions.notes}</p>
        </div>
      )}

      <div className="border-t border-gray-700/50 pt-3">
        <p className="text-xs text-gray-600 text-center">
          3D animation coming soon for uploaded diagrams
        </p>
      </div>
    </div>
  );
}
