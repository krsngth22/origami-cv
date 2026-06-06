import { useState, useRef } from "react";

export default function ImageUpload({ onUpload, isLoading }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
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
          ${dragOver ? "border-blue-400 bg-blue-900/20" : "border-gray-600 hover:border-gray-400"}`}
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
          </div>
        )}
      </div>
      {isLoading && (
        <div className="flex items-center gap-2 text-blue-400 text-sm">
          <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"/>
          Analyzing diagram...
        </div>
      )}
    </div>
  );
}
