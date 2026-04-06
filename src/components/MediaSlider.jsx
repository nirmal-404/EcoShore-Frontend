import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, VideoOff } from 'lucide-react';

const SWIPE_THRESHOLD = 50;

const optimizeCloudinaryUrl = (url = '') => {
  if (!url) {
    return '';
  }

  if (url.includes('/upload/f_auto,q_auto/')) {
    return url;
  }

  return url.replace('/upload/', '/upload/f_auto,q_auto/');
};

function MediaFallback({ type }) {
  const isVideo = type === 'video' || type === 'gif';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
      {isVideo ? (
        <VideoOff className="h-8 w-8" />
      ) : (
        <ImageOff className="h-8 w-8" />
      )}
      <p className="text-sm font-medium">
        {isVideo ? 'Video unavailable' : 'Image unavailable'}
      </p>
    </div>
  );
}

function ImageSlide({ src, alt }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <MediaFallback type="image" />;
  }

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function VideoSlide({ src, isActive, type }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const target = videoRef.current;
    if (!target) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.35 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const target = videoRef.current;
    if (!target) {
      return;
    }

    if (isActive && isInViewport) {
      target.play().catch(() => {
        // Ignore autoplay restrictions in browsers.
      });
    } else {
      target.pause();
    }
  }, [isActive, isInViewport]);

  if (hasError) {
    return <MediaFallback type={type} />;
  }

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        controls={false}
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default function MediaSlider({ media = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const normalizedMedia = useMemo(() => {
    return media.map((item) => ({
      ...item,
      url: optimizeCloudinaryUrl(item.url),
    }));
  }, [media]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [normalizedMedia.length]);

  useEffect(() => {
    if (normalizedMedia.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % normalizedMedia.length);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [normalizedMedia.length]);

  const goToPrevious = () => {
    setCurrentIndex((previous) =>
      previous === 0 ? normalizedMedia.length - 1 : previous - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((previous) => (previous + 1) % normalizedMedia.length);
  };

  const handleTouchStart = (event) => {
    setTouchStartX(event.targetTouches[0].clientX);
    setTouchEndX(event.targetTouches[0].clientX);
  };

  const handleTouchMove = (event) => {
    setTouchEndX(event.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX == null || touchEndX == null) {
      return;
    }

    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) {
      return;
    }

    if (delta > 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  if (!normalizedMedia.length) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {normalizedMedia.map((item, index) => (
          <div key={`${item.url}-${index}`} className="w-full shrink-0">
            <div className="aspect-video overflow-hidden">
              {item.type === 'image' ? (
                <ImageSlide src={item.url} alt={`Post media ${index + 1}`} />
              ) : (
                <VideoSlide
                  src={item.url}
                  type={item.type}
                  isActive={index === currentIndex}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {normalizedMedia.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white hover:bg-black/70 transition"
            aria-label="Previous media"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white hover:bg-black/70 transition"
            aria-label="Next media"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-3 py-1.5">
            {normalizedMedia.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setCurrentIndex(dotIndex)}
                className={`h-2 w-2 rounded-full transition ${
                  dotIndex === currentIndex ? 'bg-white' : 'bg-white/45'
                }`}
                aria-label={`Go to media ${dotIndex + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
