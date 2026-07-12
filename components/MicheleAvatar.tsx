"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Michele's headshot. Drop the photo at `public/michele.jpg` and it renders
 * automatically; until then (or if the file is missing) it falls back to the
 * "MC" monogram so the page is never broken.
 */
export function MicheleAvatar({ className = "" }: { className?: string }) {
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image already failed to load before hydration (so React missed the
  // onError event), a completed image with zero natural width means 404.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setErrored(true);
    }
  }, []);

  if (errored) {
    return (
      <div
        aria-hidden
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-4xl font-bold text-navy-950 ${className}`}
      >
        MC
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src="/michele.jpg"
      alt="Michele Cheng"
      onError={() => setErrored(true)}
      className={`rounded-full object-cover object-top ring-4 ring-gold-500/30 ${className}`}
    />
  );
}
