'use client'

import { useState, useRef, useEffect } from 'react'
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react'

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [isMuted, setIsMuted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-play with reduced volume for better UX
  useEffect(() => {
    if (!mounted || !audioRef.current) return

    const audio = audioRef.current
    audio.volume = volume

    const handlePlayError = () => {
      // Browser autoplay blocked - user can click play button
      console.log('[v0] Autoplay blocked by browser')
    }

    audio.addEventListener('error', handlePlayError)

    // Try to play on mount (may be blocked by browser autoplay policy)
    audio.play().catch(() => {
      // Autoplay blocked - user will need to click play button
    })

    return () => {
      audio.removeEventListener('error', handlePlayError)
    }
  }, [mounted, volume])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        // Play failed
      })
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)

    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio
        ref={audioRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Luther%20Vandross%20-%20Endless%20Love%20%28Official%20HD%20Video%29-qVi1yYsPjdVNz5TQpNlIZ2Ioeu5NSE.mp3"
        loop
        crossOrigin="anonymous"
      />

      <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg p-4 border border-white/60 hover:bg-white/90 transition-all">
        <div className="flex items-center gap-3">
          {/* Music Icon */}
          <div className="text-primary">
            <Music className="w-5 h-5" />
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="text-primary hover:text-primary/80 transition-colors p-2 hover:bg-primary/5 rounded-full"
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-primary hover:text-primary/80 transition-colors p-1"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-primary/20 rounded-full appearance-none cursor-pointer slider"
              aria-label="Volume"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(isMuted ? 0 : volume) * 100}%, rgb(229, 231, 235) ${(isMuted ? 0 : volume) * 100}%, rgb(229, 231, 235) 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}
