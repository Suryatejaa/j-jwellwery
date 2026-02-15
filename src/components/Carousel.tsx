'use client';

import { useState } from 'react';

type Slide = string | { src: string; type?: 'image' | 'video' };

interface CarouselProps {
  images: Slide[]; // accepts image URLs or video URLs (string) or objects
  title: string;
}

const isVideoSlide = (item: Slide) => {
  const src = typeof item === 'string' ? item : item.src;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
};

export default function Carousel({ images, title }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400">No Image</span>
      </div>
    );
  }

  const current = images[currentIndex];
  const currentSrc = typeof current === 'string' ? current : current.src;
  const currentIsVideo = isVideoSlide(current);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full">
      {/* Main Media */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
        {currentIsVideo ? (
          <video
            src={currentSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-auto h-auto max-w-full max-h-full object-contain"
          />
        ) : (
          <img
            src={currentSrc}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-auto h-auto max-w-full max-h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        )}

        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
              aria-label="Previous media"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
              aria-label="Next media"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Media Counter */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((item, index) => {
            const src = typeof item === 'string' ? item : item.src;
            const isVid = isVideoSlide(item);
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === index
                    ? 'border-emerald-600 ring-2 ring-emerald-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`Go to media ${index + 1}`}
              >
                {isVid ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={src}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
