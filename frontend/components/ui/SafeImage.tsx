'use client';
import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallbackIcon?: React.ReactNode;
}

export default function SafeImage({ src, alt, className, fallbackIcon, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  // If there's no src or it errored out, show the fallback
  if (!src || error) {
    return (
      <div 
        className={`bg-[var(--k-surface-3)] flex items-center justify-center text-[var(--k-ink-4)] ${className || ''}`}
        style={{ width: props.width || '100%', height: props.height || '100%' }}
      >
        {fallbackIcon || <ImageOff size={24} className="opacity-50" />}
      </div>
    );
  }

  // Next.js Image component strictly requires src to start with / or http
  const isValidSrc = src.startsWith('/') || src.startsWith('http') || src.startsWith('data:');
  
  if (!isValidSrc) {
    return (
      <div 
        className={`bg-[var(--k-surface-3)] flex items-center justify-center text-[var(--k-ink-4)] ${className || ''}`}
        style={{ width: props.width || '100%', height: props.height || '100%' }}
      >
        {fallbackIcon || <ImageOff size={24} className="opacity-50" />}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || 'Image'}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
