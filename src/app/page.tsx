'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!originalImage) return;

    setLoading(true);
    setError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process image');
      }

      setResultImage(data.data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'removed-bg.png';
    link.click();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Image Background Remover
          </h1>
          <p className="text-gray-400">
            Upload an image to remove its background instantly
          </p>
        </div>

        {/* Upload Area */}
        {!originalImage && (
          <div
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer
              ${dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-6xl mb-4">📤</div>
            <p className="text-xl mb-2">Drag & drop your image here</p>
            <p className="text-gray-500">or click to browse</p>
            <p className="text-gray-600 text-sm mt-4">Supports PNG, JPG, WEBP (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Preview & Actions */}
        {originalImage && !resultImage && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4 text-gray-300">Original Image</h3>
              <div className="flex justify-center">
                <img
                  src={originalImage}
                  alt="Original"
                  className="max-w-full max-h-96 rounded-lg object-contain"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Choose Another
              </button>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Remove Background'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {resultImage && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4 text-gray-300">Result (Transparent)</h3>
              <div className="flex justify-center">
                <div className="bg-checkered p-4 rounded-lg inline-block">
                  <img
                    src={resultImage}
                    alt="Result"
                    className="max-w-full max-h-96 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-medium transition-all"
              >
                Download Image
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600 text-sm">
          <p>Powered by remove.bg API</p>
        </div>
      </div>

      <style jsx global>{`
        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #ccc 25%, transparent 25%), 
            linear-gradient(-45deg, #ccc 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #ccc 75%), 
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </main>
  );
}
