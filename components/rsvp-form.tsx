"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

const XANO_GUEST_URL = "https://x8ki-letl-twmt.n7.xano.io/api:YDOACrMa/guest"

type Attendance = "akan_hadir" | "tidak_hadir"

interface RSVPFormProps {
  onSubmit?: (data: {
    name: string
    attendance: Attendance
    numberOfGuests: number
    blessing: string
    sessionId: string
  }) => void
  totalConfirmed?: number
}

const MAX_CAPACITY = 250

export function RSVPForm({ onSubmit, totalConfirmed = 0 }: RSVPFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    attendance: "" as Attendance | "",
    numberOfGuests: 1,
    blessing: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCapacityReached = totalConfirmed >= MAX_CAPACITY
  const remainingCapacity = MAX_CAPACITY - totalConfirmed

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfGuests" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const postRSVP = async () => {
    const payload = {
      name: formData.name.trim(),
      numberOfGuests: Number(formData.numberOfGuests) || 1,
      blessing: formData.blessing.trim(),
      attendance: formData.attendance || null,
    }

    const res = await fetch(XANO_GUEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(text || `Request failed with ${res.status}`)
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.attendance) {
      alert("Mohon isi semua field yang diperlukan")
      return
    }

    if (isCapacityReached && formData.attendance === "akan_hadir") {
      alert("Maaf, kapasitas ruangan sudah penuh. Terima kasih atas minat Anda!")
      return
    }

    setLoading(true)
    setError(null)

    const sessionId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36)

    try {
      await postRSVP()

      onSubmit?.({
        name: formData.name,
        attendance: formData.attendance as Attendance,
        numberOfGuests: formData.attendance === "tidak_hadir" ? 0 : formData.numberOfGuests,
        blessing: formData.blessing,
        sessionId,
      })

      setFormData({ name: "", attendance: "", numberOfGuests: 1, blessing: "" })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat mengirim RSVP.")
    } finally {
      setLoading(false)
    }
  }

  const isNotAttending = formData.attendance === "tidak_hadir"

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 sm:space-y-8 bg-white/60 backdrop-blur-md p-6 sm:p-10 md:p-14 rounded-3xl border border-white/60 shadow-xl"
    >
      {submitted && (
        <div className="p-4 sm:p-6 bg-primary/15 border-2 border-primary/40 rounded-2xl text-primary text-center font-semibold text-base sm:text-lg animate-in fade-in">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2 mb-1 fill-primary" />
          Terima kasih! RSVP Anda telah dikonfirmasi.
        </div>
      )}

      {error && <div className="p-4 rounded-xl border-2 border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>}

      {isCapacityReached && (
        <div className="p-4 sm:p-6 bg-accent/15 border-2 border-accent/40 rounded-2xl text-accent text-center font-semibold text-base sm:text-lg">
          Kapasitas ruangan telah penuh. Kami masih menerima konfirmasi "Tidak Hadir".
        </div>
      )}

      <div>
        <label className="form-label">Nama Lengkap *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Masukkan nama Anda"
          className="form-input"
          required
          disabled={loading || isCapacityReached}
        />
      </div>

      <div>
        <label className="form-label">Apakah Anda akan hadir? *</label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, attendance: "akan_hadir" }))}
            disabled={isCapacityReached}
            className={`p-4 sm:p-6 rounded-2xl border-3 transition-all font-semibold text-base sm:text-lg ${
              formData.attendance === "akan_hadir"
                ? "bg-primary/20 border-primary text-primary shadow-md"
                : "bg-white border-border text-foreground hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            <span className="text-xl sm:text-2xl mb-1 block">✓</span>
            Akan Hadir
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, attendance: "tidak_hadir" }))}
            className={`p-4 sm:p-6 rounded-2xl border-3 transition-all font-semibold text-base sm:text-lg ${
              formData.attendance === "tidak_hadir"
                ? "bg-secondary/30 border-accent text-accent shadow-md"
                : "bg-white border-border text-foreground hover:border-accent/50 hover:bg-secondary/5"
            }`}
          >
            <span className="text-xl sm:text-2xl mb-1 block">✗</span>
            Tidak Hadir
          </button>
        </div>
      </div>

      <div>
        <label className="form-label">
          Jumlah Tamu Termasuk Anda
          {isNotAttending && <span className="text-foreground/50"> (Otomatis 0)</span>}
        </label>
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                numberOfGuests: Math.max(1, prev.numberOfGuests - 1),
              }))
            }
            className="w-12 h-12 sm:w-16 sm:h-16 bg-muted hover:bg-muted/80 rounded-2xl font-bold text-xl sm:text-2xl text-foreground transition-all disabled:opacity-50"
            disabled={loading || isNotAttending}
          >
            −
          </button>
          <div className="text-center">
            <input
              type="number"
              name="numberOfGuests"
              value={isNotAttending ? 0 : formData.numberOfGuests}
              onChange={handleChange}
              min={1}
              max={2}
              className="w-16 sm:w-20 text-center px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-xl sm:text-2xl font-bold disabled:bg-muted/30 disabled:cursor-not-allowed"
              disabled={loading || isNotAttending}
            />
            <p className="text-xs sm:text-sm text-foreground/60 mt-2">dari 2 orang</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                numberOfGuests: Math.min(2, prev.numberOfGuests + 1),
              }))
            }
            className="w-12 h-12 sm:w-16 sm:h-16 bg-muted hover:bg-muted/80 rounded-2xl font-bold text-xl sm:text-2xl text-foreground transition-all disabled:opacity-50"
            disabled={loading || isNotAttending}
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="form-label">Ucapan atau Doa untuk Kami (Opsional)</label>
        <textarea
          name="blessing"
          value={formData.blessing}
          onChange={handleChange}
          placeholder="Tuliskan ucapan terbaik atau doa untuk Marina & Juan..."
          rows={5}
          className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-base sm:text-lg leading-relaxed"
          disabled={loading || isCapacityReached}
        />
      </div>

      <Button
        type="submit"
        disabled={loading || isCapacityReached}
        className="w-full py-4 sm:py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-base sm:text-xl transition-all hover:shadow-lg disabled:opacity-60"
      >
        {loading ? "Mengirim..." : isCapacityReached ? "Kapasitas Penuh" : "Kirim RSVP"}
      </Button>

      <p className="text-sm sm:text-base text-foreground/60 text-center">
        Terima kasih atas konfirmasi kehadiran Anda
      </p>
    </form>
  )
}
