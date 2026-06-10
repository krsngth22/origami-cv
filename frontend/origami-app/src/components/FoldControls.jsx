export default function FoldControls({
  steps,
  currentIndex,
  isAnimating,
  onNext,
  onUndo,
  onReset
}) {
  if (!steps) return null;

  const current = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <button
          onClick={onReset}
          disabled={isAnimating}
          className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-all"
        >
          Reset ↺
        </button>
      </div>

      {current && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-blue-300 bg-blue-900/40 px-2 py-1 rounded-full">
              {current.fold_type}
            </span>
          </div>
          <p className="text-white text-sm leading-relaxed">{current.instruction}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={isFirst || isAnimating}
          className="flex-1 py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition-all"
        >
          ← Undo
        </button>
        <button
          onClick={onNext}
          disabled={isLast || isAnimating}
          className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition-all"
        >
          Next →
        </button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentIndex
                ? "bg-blue-400"
                : i === currentIndex
                ? "bg-blue-600 scale-125"
                : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      {isLast && (
        <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3 text-center">
          <p className="text-green-300 text-sm font-medium">🎉 Folding complete!</p>
          <button
            onClick={onReset}
            className="text-xs text-green-400 mt-1 hover:text-green-200 transition-all"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}