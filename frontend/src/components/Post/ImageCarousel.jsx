import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image } from "lucide-react";

const ImageCarousel = ({ images, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);

  // Set up keyboard listeners for navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && images?.length > 1) {
        navigateImage("prev");
      }
      if (e.key === "ArrowRight" && images?.length > 1) {
        navigateImage("next");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images]);

  // Handle image navigation with animation
  const navigateImage = (direction) => {
    if (!images || images.length <= 1 || isImageTransitioning) return;
    
    setIsImageTransitioning(true);
    
    if (direction === "next") {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsImageTransitioning(false);
    }, 500);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative w-full h-96 ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={images[currentIndex].image_url}
          alt={`Image ${currentIndex + 1}`}
          className={`w-full h-full object-cover absolute inset-0 transition-transform duration-500 ease-in-out ${
            isImageTransitioning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
          }`}
          style={{
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease"
          }}
        />
        
        {/* Image Navigation (only if multiple images) */}
        {images.length > 1 && (
          <>
            {/* Image Counter (e.g., 1/5) */}
            <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <Image className="w-3 h-3 mr-1" />
              <span>{currentIndex + 1}/{images.length}</span>
            </div>
            
            {/* Navigation buttons */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md hover:bg-white hover:scale-105 transition-all z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md hover:bg-white hover:scale-105 transition-all z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>
            
            {/* Enhanced Image Indicator Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageTransitioning(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsImageTransitioning(false), 500);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-blue-600 w-3 h-2" 
                      : "bg-white/70 hover:bg-white/90 w-2 h-2"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;