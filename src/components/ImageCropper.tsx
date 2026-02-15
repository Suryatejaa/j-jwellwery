'use client';

import { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (croppedImage: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropDone, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Aspect handling: undefined = free crop
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [originalAspect, setOriginalAspect] = useState<number | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    const onLoad = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setOriginalAspect(img.naturalWidth / img.naturalHeight);
      } else {
        setOriginalAspect(null);
      }
    };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', () => setOriginalAspect(null));
    return () => {
      img.removeEventListener('load', onLoad);
    };
  }, [imageSrc]);

  const aspectLabel =
    aspect === undefined
      ? 'Free'
      : originalAspect && Math.abs((aspect || 0) - originalAspect) < 0.001
      ? 'Original'
      : aspect === 1
      ? '1:1'
      : aspect === 3 / 4
      ? '3:4'
      : aspect === 4 / 3
      ? '4:3'
      : aspect === 16 / 9
      ? '16:9'
      : `${aspect?.toFixed(2)}`;

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }; 

  const handleCropImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageSrc;

      image.onload = () => {
        const { x, y, width, height } = croppedAreaPixels;

        // Ensure canvas dimensions match the cropped area
        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }

        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the cropped portion
        ctx.drawImage(
          image,
          Math.floor(x),
          Math.floor(y),
          Math.floor(width),
          Math.floor(height),
          0,
          0,
          Math.floor(width),
          Math.floor(height)
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Failed to create blob from canvas');
              return;
            }
            const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCropDone(file);
          },
          'image/jpeg',
          0.95
        );
      };

      image.onerror = () => {
        console.error('Failed to load image for cropping:', imageSrc);
      };
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Crop Image — Aspect: {aspectLabel}</h3>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAspect(undefined)}
              className={`px-3 py-1 rounded-md border text-sm ${aspect === undefined ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Free
            </button>

            <button
              type="button"
              onClick={() => setAspect(originalAspect ?? undefined)}
              disabled={!originalAspect}
              className={`px-3 py-1 rounded-md border text-sm ${originalAspect && Math.abs((aspect || 0) - (originalAspect || 0)) < 0.001 ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'} ${!originalAspect ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Original
            </button>

            <button
              type="button"
              onClick={() => setAspect(1)}
              className={`px-3 py-1 rounded-md border text-sm ${aspect === 1 ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
            >
              1:1
            </button>

            <button
              type="button"
              onClick={() => setAspect(3 / 4)}
              className={`px-3 py-1 rounded-md border text-sm ${Math.abs((aspect || 0) - 3 / 4) < 0.001 ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
            >
              3:4
            </button>

            <button
              type="button"
              onClick={() => setAspect(4 / 3)}
              className={`px-3 py-1 rounded-md border text-sm ${Math.abs((aspect || 0) - 4 / 3) < 0.001 ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
            >
              4:3
            </button>

            <button
              type="button"
              onClick={() => setAspect(16 / 9)}
              className={`px-3 py-1 rounded-md border text-sm ${Math.abs((aspect || 0) - 16 / 9) < 0.001 ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
            >
              16:9
            </button>
          </div>

          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-6">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              {...(typeof aspect === 'number' ? { aspect } : {})}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              restrictPosition={false}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropImage}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
