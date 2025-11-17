"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryImage {
  src: string
  alt: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  autoPlay?: boolean
  autoPlayInterval?: number
}

function ShimmerSkeleton() {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted">
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  )
}

export function ImageGallery({ images, autoPlay = true, autoPlayInterval = 5000 }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]))
  const [loadingImages, setLoadingImages] = useState<Set<number>>(
    new Set(Array.from({ length: images.length }, (_, i) => i)),
  )
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [scrollingImages, setScrollingImages] = useState<Set<number>>(new Set())

  const preloadImage = useCallback(
    (index: number) => {
      if (loadedImages.has(index)) return
      setLoadedImages((prev) => new Set([...prev, index]))
    },
    [loadedImages],
  )

  useEffect(() => {
    const nextIndex = (currentIndex + 1) % images.length
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    preloadImage(nextIndex)
    preloadImage(prevIndex)
  }, [currentIndex, images.length, preloadImage])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
          
          if (entry.isIntersecting) {
            setScrollingImages((prev) => new Set([...prev, index]))
            preloadImage(index)
          } else {
            setScrollingImages((prev) => {
              const next = new Set(prev)
              next.delete(index)
              return next
            })
          }
        })
      },
      { rootMargin: "150px" },
    )

    const thumbnails = scrollContainerRef.current?.querySelectorAll("[data-index]")
    thumbnails?.forEach((thumb) => {
      observerRef.current?.observe(thumb)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [preloadImage])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX)
    handleSwipe()
  }

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }
  }

  const handleImageLoad = useCallback((index: number) => {
    setLoadingImages((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }, [])

  useEffect(() => {
    if (!isAutoPlay || images.length === 0) return

    const timer = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isAutoPlay, autoPlayInterval, goToNext, images.length])

  if (images.length === 0) {
    return <div className="text-center text-foreground/50 text-sm sm:text-base">No images available</div>
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-5"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Main Image Slider */}
      <div
        className="relative w-full h-48 sm:h-80 md:h-96 lg:h-[500px] rounded-lg sm:rounded-xl md:rounded-2xl bg-muted shadow-lg flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl ring-1 ring-primary/20 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {loadingImages.has(index) && <ShimmerSkeleton />}

            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === currentIndex}
              loading={loadedImages.has(index) ? "eager" : "lazy"}
              quality={index === currentIndex ? 85 : 60}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 90vw, 896px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0e8d8' width='400' height='300'/%3E%3C/svg%3E"
              onLoadingComplete={() => handleImageLoad(index)}
            />
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={goToPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 md:p-3 rounded-full bg-white/40 hover:bg-white/60 text-foreground transition-all backdrop-blur-sm hover:shadow-md active:scale-95"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 md:p-3 rounded-full bg-white/40 hover:bg-white/60 text-foreground transition-all backdrop-blur-sm hover:shadow-md active:scale-95"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/40 text-white text-xs sm:text-sm font-medium backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation with Scroll Lazy Loading */}
      <div ref={scrollContainerRef} className="flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2 px-1 justify-center">
        {images.map((image, index) => (
          <button
            key={index}
            data-index={index}
            onClick={() => goToSlide(index)}
            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden transition-all ${
              index === currentIndex
                ? "ring-2 ring-primary shadow-lg scale-105"
                : "opacity-70 hover:opacity-100 ring-1 ring-border hover:ring-primary/50"
            }`}
            aria-label={`Go to image ${index + 1}`}
          >
            {(loadingImages.has(index) || scrollingImages.has(index)) && <ShimmerSkeleton />}

            <Image
              src={image.src || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              loading="lazy"
              quality={50}
              sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f0e8d8' width='100' height='100'/%3E%3C/svg%3E"
              onLoadingComplete={() => handleImageLoad(index)}
            />
          </button>
        ))}
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5 sm:gap-2 pt-1 sm:pt-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? "w-6 sm:w-8 bg-primary h-2 rounded-full"
                : "w-2 h-2 bg-primary/40 rounded-full hover:bg-primary/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}