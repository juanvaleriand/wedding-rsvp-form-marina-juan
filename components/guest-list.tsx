"use client"

import { Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Attendance = "akan_hadir" | "tidak_hadir" | null

interface Guest {
  id: string | number
  name: string
  attendance: Attendance
  numberOfGuests: number
  blessing: string
  timestamp: number
  sessionId: string
}

const API_URL = process.env.NEXT_PUBLIC_XANO_GUEST_URL || "https://x8ki-letl-twmt.n7.xano.io/api:YDOACrMa/guest"

const ITEMS_PER_PAGE = 10

export function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSessionIds, setCurrentSessionIds] = useState<Set<string>>(new Set())
  const [confirmedPage, setConfirmedPage] = useState(1)
  const [declinedPage, setDeclinedPage] = useState(1)

  const fetchGuests = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(`Request failed with ${res.status}`)
      const data = await res.json()
      setGuests(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data tamu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedSessions = localStorage.getItem("my_rsvp_sessions")
    const sessions = storedSessions ? JSON.parse(storedSessions) : []
    setCurrentSessionIds(new Set(sessions))
    fetchGuests()
  }, [])

  const confirmedGuests = useMemo(() => guests.filter((g) => g.attendance === "akan_hadir"), [guests])
  const declinedGuests = useMemo(() => guests.filter((g) => g.attendance === "tidak_hadir"), [guests])

  const confirmedPaginated = useMemo(() => {
    const start = (confirmedPage - 1) * ITEMS_PER_PAGE
    return confirmedGuests.slice(start, start + ITEMS_PER_PAGE)
  }, [confirmedGuests, confirmedPage])

  const declinedPaginated = useMemo(() => {
    const start = (declinedPage - 1) * ITEMS_PER_PAGE
    return declinedGuests.slice(start, start + ITEMS_PER_PAGE)
  }, [declinedGuests, declinedPage])

  const confirmedPageCount = Math.ceil(confirmedGuests.length / ITEMS_PER_PAGE)
  const declinedPageCount = Math.ceil(declinedGuests.length / ITEMS_PER_PAGE)

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch(`${API_URL}/NA`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id) }),
      })
      if (!res.ok) throw new Error("Gagal menghapus tamu")
      setGuests((prev) => prev.filter((g) => String(g.id) !== String(id)))
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus tamu")
    }
  }

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null
    return (
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-foreground font-medium mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (loading && guests.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-8 border border-white/60 text-center">
        <p className="text-foreground/60">Memuat daftar tamu…</p>
      </div>
    )
  }

  if (error && guests.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-8 border border-white/60 text-center">
        <p className="text-accent">{error}</p>
        <button onClick={fetchGuests} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
          Coba lagi
        </button>
      </div>
    )
  }

  if (guests.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-8 border border-white/60 text-center">
        <p className="text-foreground/60">Belum ada konfirmasi RSVP</p>
        <button onClick={fetchGuests} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
          Muat ulang
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-2xl">
      {confirmedGuests.length > 0 && (
        <div className="bg-white/40 backdrop-blur-md rounded-xl p-6 border border-white/60 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <span className="text-lg">✓</span> Akan Hadir ({confirmedGuests.length})
            </h3>
            <button onClick={fetchGuests} className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
              Muat ulang
            </button>
          </div>
          <div className="space-y-3">
            {confirmedPaginated.map((guest) => (
              <div key={guest.id} className="flex items-start justify-between gap-4 p-3 bg-white/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{guest.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-foreground/50">
                    <span>{guest.numberOfGuests} orang</span>
                  </div>
                  {guest.blessing && <p className="text-sm text-primary/70 mt-2 italic">"{guest.blessing}"</p>}
                </div>
                {currentSessionIds.has(guest.sessionId) && (
                  <button
                    onClick={() => handleDelete(guest.id)}
                    className="flex-shrink-0 p-2 hover:bg-accent/20 rounded-lg transition-colors text-accent"
                    aria-label="Hapus tamu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <PaginationControls
            currentPage={confirmedPage}
            totalPages={confirmedPageCount}
            onPageChange={setConfirmedPage}
          />
        </div>
      )}

      {declinedGuests.length > 0 && (
        <div className="bg-white/40 backdrop-blur-md rounded-xl p-6 border border-white/60 overflow-hidden">
          <h3 className="font-semibold text-accent mb-4 flex items-center gap-2">
            <span className="text-lg">✗</span> Tidak Hadir ({declinedGuests.length})
          </h3>
          <div className="space-y-3">
            {declinedPaginated.map((guest) => (
              <div
                key={guest.id}
                className="flex items-start justify-between gap-4 p-3 bg-white/50 rounded-lg opacity-75"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{guest.name}</p>
                </div>
                {currentSessionIds.has(guest.sessionId) && (
                  <button
                    onClick={() => handleDelete(guest.id)}
                    className="flex-shrink-0 p-2 hover:bg-accent/20 rounded-lg transition-colors text-accent"
                    aria-label="Hapus tamu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <PaginationControls
            currentPage={declinedPage}
            totalPages={declinedPageCount}
            onPageChange={setDeclinedPage}
          />
        </div>
      )}
    </div>
  )
}
