"use client"

import { Users } from "lucide-react"

interface GuestCounterProps {
  totalConfirmed: number
  totalResponses: number
}

export function GuestCounter({ totalConfirmed, totalResponses }: GuestCounterProps) {
  const MAX_CAPACITY = 300

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-8 md:p-10 border border-white/60 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Users className="w-6 h-6 text-primary" />
          <p className="text-lg md:text-xl text-foreground/60 font-medium">Akan Hadir</p>
        </div>
        <p className="text-5xl md:text-6xl font-light text-primary">
          {totalConfirmed}/{MAX_CAPACITY}
        </p>
        <p className="text-sm text-foreground/50 mt-2">{totalResponses} tamu mengkonfirmasi</p>
      </div>
    </div>
  )
}
