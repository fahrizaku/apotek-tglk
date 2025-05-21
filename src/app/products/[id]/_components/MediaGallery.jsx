"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

const MediaGallery = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // Fallback if no media
  if (!media || media.length === 0) {
    return (
      <div className="relative w-full h-64 sm:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Tidak ada media</span>
      </div>
    );
  }

  const currentMedia = media[currentIndex];

  // Navigation handlers
  const handlePrevious = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  // Lightbox controls
  const openLightbox = (index, e) => {
    e?.stopPropagation();
    setLightboxIndex(index);
    setShowLightbox(true);
    setIsVideoPlaying(false);
  };

  const closeLightbox = (e) => {
    e?.stopPropagation();
    setShowLightbox(false);
    setIsVideoPlaying(false);
  };

  const handleLightboxNav = (direction, e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => {
      const newIndex =
        direction === "prev"
          ? prev === 0
            ? media.length - 1
            : prev - 1
          : prev === media.length - 1
          ? 0
          : prev + 1;
      setIsVideoPlaying(false);
      return newIndex;
    });
  };

  const playVideo = (e) => {
    e?.stopPropagation();
    setIsVideoPlaying(true);
    videoRef.current?.play();
  };

  // Thumbnail Component
  const Thumbnail = ({ item, index, isActive, onClick }) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
        isActive ? "border-orange-500" : "border-transparent"
      }`}
    >
      <Image
        src={item.thumbnail || item.url}
        alt={item.caption || `Media ${index + 1}`}
        width={100}
        height={100}
        className="w-16 h-16 object-cover"
        onError={(e) => {
          e.target.src =
            "https://ik.imagekit.io/j4eizgagj/Beng-Beng%20Wafer%20Chocolate%20Maxx%2032G.jpg?updatedAt=1738334778261";
        }}
      />
      {item.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );

  // Video Thumbnail Component
  const VideoThumbnail = ({ media, onClick }) => (
    <div
      className="relative w-full h-64 sm:h-80 md:h-96 cursor-pointer rounded-lg overflow-hidden"
      onClick={onClick}
    >
      <Image
        src={
          media.thumbnail ||
          "https://ik.imagekit.io/j4eizgagj/Beng-Beng%20Wafer%20Chocolate%20Maxx%2032G.jpg?updatedAt=1738334778261"
        }
        alt={media.caption || "Video thumbnail"}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-opacity-30 transition-all">
        <div className="bg-white bg-opacity-80 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all">
          <Play className="h-6 w-6 text-orange-600" />
        </div>
      </div>
      {media.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
          {media.caption}
        </div>
      )}
    </div>
  );

  // Lightbox Component
  const Lightbox = () => {
    const lightboxMedia = media[lightboxIndex];

    return (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={closeLightbox}
      >
        <button
          onClick={closeLightbox}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-[60]"
        >
          <X className="h-8 w-8" />
        </button>

        <div className="flex items-center justify-center w-full h-full">
          <button
            onClick={(e) => handleLightboxNav("prev", e)}
            className="absolute left-4 text-white hover:text-gray-300 z-[60]"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          <div
            className="w-full h-full max-w-4xl max-h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxMedia.type === "image" ? (
              <Image
                src={lightboxMedia.url}
                alt={lightboxMedia.caption || `Media ${lightboxIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-full max-w-full object-contain"
              />
            ) : isVideoPlaying ? (
              <video
                ref={videoRef}
                src={lightboxMedia.url}
                controls
                autoPlay
                className="max-h-full max-w-full"
                poster={
                  lightboxMedia.thumbnail ||
                  "https://ik.imagekit.io/j4eizgagj/Beng-Beng%20Wafer%20Chocolate%20Maxx%2032G.jpg?updatedAt=1738334778261"
                }
              />
            ) : (
              <div
                className="relative w-full max-w-4xl cursor-pointer"
                onClick={playVideo}
              >
                <Image
                  src={
                    lightboxMedia.thumbnail ||
                    "https://ik.imagekit.io/j4eizgagj/Beng-Beng%20Wafer%20Chocolate%20Maxx%2032G.jpg?updatedAt=1738334778261"
                  }
                  alt={lightboxMedia.caption || "Video thumbnail"}
                  width={1200}
                  height={800}
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-80 rounded-full p-5 shadow-lg hover:bg-opacity-100 transition-all">
                    <Play className="h-12 w-12 text-orange-600" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={(e) => handleLightboxNav("next", e)}
            className="absolute right-4 text-white hover:text-gray-300 z-[60]"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </div>

        {lightboxMedia.caption && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-white p-2 z-[60]">
            <p className="text-sm">{lightboxMedia.caption}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full relative">
      {/* Main Media Display */}
      <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-100 mb-2">
        {currentMedia.type === "image" ? (
          <div
            className="relative w-full h-64 sm:h-80 md:h-96 cursor-pointer"
            onClick={(e) => openLightbox(currentIndex, e)}
          >
            <Image
              src={currentMedia.url}
              alt={currentMedia.caption || `Media ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
            {currentMedia.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                {currentMedia.caption}
              </div>
            )}
          </div>
        ) : (
          <VideoThumbnail
            media={currentMedia}
            onClick={(e) => openLightbox(currentIndex, e)}
          />
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 shadow hover:bg-opacity-100 z-10"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {media.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2 no-scrollbar">
          {media.map((item, index) => (
            <Thumbnail
              key={index}
              item={item}
              index={index}
              isActive={currentIndex === index}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && <Lightbox />}
    </div>
  );
};

export default MediaGallery;
