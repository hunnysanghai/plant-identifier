'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface PlantInfo {
    name: string;
    family: string;
    sciname: string;
    maintenance: string;
    soil: string;
    temperature: string;
    benefits: string;
    diagnosis: string;
}

export default function PlantDetectionForm() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<PlantInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);  // Add a state to track video readiness
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent); // Check if the device is mobile
      const constraints = {
        video: {
          facingMode: isMobile ? { exact: 'environment' } : 'user' // Use back camera on mobile, front camera on desktop
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.classList.remove('hidden'); // Make video element visible
        setIsVideoReady(false); // Reset video readiness state

        // Wait for the video to be fully loaded and ready
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true); // Mark the video as ready to capture
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please ensure your browser has permission to use the camera.');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' });
            setFile(file);
            setImagePreview(canvasRef.current!.toDataURL('image/jpeg'));
            // Stop the video stream after capturing the image
            const stream = videoRef.current!.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop()); // Stop all video tracks

            videoRef.current?.classList.add('hidden'); // Hide video element
            setIsVideoReady(false); // Reset video readiness state
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/detect-plant', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to detect plant');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error detecting plant:', error);
      setError('Error detecting plant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="w-full flex justify-center">
        <video ref={videoRef} className="hidden" width={300} height={300} />
        <canvas ref={canvasRef} className="hidden" width={640} height={480} />
        </div>
        <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full md:w-auto bg-blue-400 text-white rounded-lg py-3 px-6 hover:bg-opacity-60 transition text-center font-bold"
          >
            Upload Image
          </button>

          <button
            type="button"
            onClick={handleCameraCapture}
            className="w-full md:w-auto bg-orange-400 text-white rounded-lg py-3 px-6 hover:bg-opacity-60 transition text-center font-bold"
          >
            Open Camera
          </button>

          <button
            type="button"
            onClick={captureImage}
            className="w-full md:w-auto bg-yellow-400 text-white rounded-lg py-3 px-6 hover:bg-opacity-60 transition text-center font-bold"
            disabled={!isVideoReady} // Disable the capture button until the video is ready
          >
            Capture Image
          </button>
        </div>

        {imagePreview && (
          <div className="w-full flex justify-center">
            <div className="shadow-card rounded-lg overflow-hidden border-4 border-white">
              <Image src={imagePreview} alt="Preview" width={300} height={300} />
            </div>
          </div>
        )}


        <button
          type="submit"
          className="w-full bg-green-700 text-white rounded-lg py-3 hover:bg-purple-600 transition font-bold"
          disabled={!file || isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Plant'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FlashCard title="Name" content={result.name} />
          <FlashCard title="Family" content={result.family} />
          <FlashCard title="Scientific Name" content={result.sciname} />
          <FlashCard title="Maintenance" content={result.maintenance} />
          <FlashCard title="Soil Requirements" content={result.soil} />
          <FlashCard title="Ideal Temperature" content={result.temperature} />
          <FlashCard title="Medicinal Benefits" content={result.benefits} />
          <FlashCard title="Diagnosis" content={result.diagnosis} />
        </div>
      )}
    </div>
  );
}

function FlashCard({ title, content }: { title: string, content: string }) {
  return (
    <div className="p-6 bg-white shadow-card rounded-lg transform transition-all duration-300 hover:scale-120">
      <h2 className="text-xl font-bold text-black mb-2">{title}</h2>
      <p className="text-black">{content}</p>
    </div>
  );
}