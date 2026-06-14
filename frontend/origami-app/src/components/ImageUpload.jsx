import { useState, useRef, useEffect } from "react";

const LOADING_MESSAGES = [
  "Detecting fold symbols...",
  "Running YOLO inference...",
  "Sending detections to Claude...",
  "Generating step-by-step instructions...",
];

export default function ImageUpload({ onUpload, isLoading }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const inputRef = useRef();

  useEffect(() => {
    if (!isLoading) {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Image is too large. Please use a file under 10MB.");
      return;
    }
    setFileError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragOver ? "border-blue-400 bg-blue-900/20" : "border-gray-600 hover:border-gray-400"}
          ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="text-gray-400">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm">Drop an origami diagram here or click to browse</p>
            <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>

      {fileError && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
          <p className="text-red-400 text-xs">{fileError}</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-1">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
            Analyzing diagram...
          </div>
          <p className="text-xs text-blue-400/70 transition-all duration-300">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
          <div className="w-full h-1 bg-blue-900/40 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
