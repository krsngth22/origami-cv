export default function StepPanel({ instructions, currentStepIndex, onStepChange, isAnimating }) {
  if (!instructions) return (
    <div className="text-gray-500 text-sm text-center py-8">
      Upload an origami diagram to get started
    </div>
  );

  const steps = instructions.steps || [];
  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {instructions.difficulty} · {instructions.estimated_steps} steps
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
            <span className="text-xs text-blue-300 bg-blue-900/40 px-2 py-1 rounded-full">
              {currentStep.fold_type}
            </span>
          </div>
          <p className="text-white font-medium mb-2">{currentStep.instruction}</p>
          <p className="text-gray-400 text-sm">{currentStep.explanation}</p>
          <p className="text-gray-500 text-xs mt-2">📍 {currentStep.position}</p>
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
              ${i === currentStepIndex ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}
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
    </div>
  );
}
