import { useEffect, useState } from 'react';
import { ImageStorageService } from '../../services/images/ImageStorageService';

interface CoverImageProps {
  imageRef: string | null;
  imageUrl: string | null;
  alt: string;
  className?: string;
}

export function CoverImage({ imageRef, imageUrl, alt, className = 'w-full h-full object-cover' }: CoverImageProps) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageRef) {
      setLocalUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    const loadImage = async () => {
      try {
        const blob = await ImageStorageService.getImageBlob(imageRef);
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setLocalUrl(objectUrl);
          setHasError(false);
        }
      } catch (err) {
        console.error('Failed to load local image:', err);
        setHasError(true);
      }
    };

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageRef]);

  const displayUrl = hasError ? null : (localUrl || imageUrl);

  if (!displayUrl) {
    return (
      <div className={`bg-neutral-700 flex items-center justify-center ${className}`}>
        <div className="text-center p-2">
          <div className="text-3xl mb-1">📚</div>
          <div className="text-xs text-neutral-400">No Cover</div>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={displayUrl} 
      alt={alt} 
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
