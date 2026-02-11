'use client';

import { useState } from 'react';
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
          <h3 className="text-lg font-semibold mb-4">Crop Image (1:1 ratio)</h3>

          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-6">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
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
