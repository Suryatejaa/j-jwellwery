'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroCarouselProps {
  images: string[];
  intervalMs?: number;
}

export default function HeroCarousel({ images, intervalMs = 4000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const advancedRef = useRef(false);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    // Reset guard each time index changes
    advancedRef.current = false;

    const currentSrc = images[index];
    const isCurrentVideo = /\.mp4$/i.test(currentSrc);

    let intervalId: ReturnType<typeof setInterval> | undefined;

    // Clear previous fallback if any
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    const advance = () => setIndex((i) => (i + 1) % images.length);

    if (isCurrentVideo) {
      // If current slide is a video, control playback via a captured ref and advance on ended
      const vidEl = videoRef.current;
      if (vidEl) {
        try {
          vidEl.currentTime = 0;
        } catch (e) {
          /* ignore */
        }
        // Try to autoplay muted video
        vidEl.play().catch((e) => console.debug('Video play failed:', e));

        // Advance on ended (idempotent via advancedRef)
        const onVideoEnded = () => {
          if (!advancedRef.current) {
            advancedRef.current = true;
            advance();
          }
        };
        vidEl.onended = onVideoEnded;

        // Fallback: if onended doesn't fire, advance after duration + small buffer
        const durationMs = isFinite(vidEl.duration) && vidEl.duration > 0 ? vidEl.duration * 1000 : intervalMs;
        fallbackTimerRef.current = window.setTimeout(() => {
          if (!advancedRef.current) {
            advancedRef.current = true;
            advance();
          }
        }, durationMs + 250);
      } else {
        // No video element available yet; as a safety, still set a fallback
        fallbackTimerRef.current = window.setTimeout(() => {
          if (!advancedRef.current) {
            advancedRef.current = true;
            advance();
          }
        }, intervalMs + 250);
      }
    } else {
      // Non-video slides: use interval for auto-advance
      intervalId = setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
      }, intervalMs);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      const vidEl = videoRef.current;
      if (vidEl) {
        // pause any playing video and remove handler when leaving this effect
        try {
          vidEl.pause();
        } catch (e) {
          /* ignore */
        }
        try {
          vidEl.onended = null;
        } catch (e) {
          /* ignore */
        }
      }
    };
  }, [index, images, intervalMs]);

  if (!images || images.length === 0) return null;

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="w-full rounded-lg overflow-hidden relative bg-gray-100">
      <div className="w-full">
        <div className="mx-auto max-w-2xl px-4">
          {/* Aspect-ratio box to keep 16:9 on all sizes, centered with side gaps on large screens */}
          <div className="relative w-full pb-[56.25%]">
{images.map((src, i) => {
              const isVideo = /\.mp4$/i.test(src);
              if (isVideo) {
                return (
                  <video
                    key={i}
                    ref={i === index ? videoRef : null}
                    src={src}
                    playsInline
                    muted
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  />
                );
              }

              return (
                <img
                  key={i}
                  src={src}
                  alt={`Banner ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              );
            })}

            {/* Controls placed inside the centered aspect box */}
            {images.length > 1 && (
              <>
    

                <button
                  aria-label="Previous"
                  onClick={() => goPrev()}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 rounded-full p-1 shadow-md hover:bg-white/90 focus:outline-none z-20"
                >
                  ‹
                </button>

                <button
                  aria-label="Next"
                  onClick={() => goNext()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 rounded-full p-1 shadow-md hover:bg-white/90 focus:outline-none z-20"
                >
                  ›
                </button>

                {/* Indicators */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-3 flex gap-2 z-20">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === index ? 'bg-white w-6' : 'bg-white/60 w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
