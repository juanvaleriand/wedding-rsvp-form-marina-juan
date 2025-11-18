"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, MapPin, Calendar, Clock, Users } from "lucide-react";
import { RSVPForm } from "@/components/rsvp-form";
import { GuestCounter } from "@/components/guest-counter";
import { GuestList } from "@/components/guest-list";
import { GiftCard } from "@/components/gift-card";
import { ImageGallery } from "@/components/image-gallery";
import { MusicPlayer } from "@/components/music-player";

type Attendance = "akan_hadir" | "tidak_hadir" | null;

interface Guest {
  id: string | number;
  name: string;
  attendance: Attendance;
  numberOfGuests: number;
  blessing: string;
  timestamp: number;
  sessionId: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_XANO_GUEST_URL ||
  "https://x8ki-letl-twmt.n7.xano.io/api:YDOACrMa/guest";

export default function Home() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestList, setShowGuestList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data tamu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [refreshKey]);

  const handleAddGuest = (guestData: Omit<Guest, "id" | "timestamp">) => {
    const existingSessions = localStorage.getItem("my_rsvp_sessions");
    const sessions = existingSessions ? JSON.parse(existingSessions) : [];
    sessions.push(guestData.sessionId);
    localStorage.setItem("my_rsvp_sessions", JSON.stringify(sessions));
    setRefreshKey((k) => k + 1);
  };

  const confirmingGuests = useMemo(
    () => guests.filter((g) => g.attendance === "akan_hadir"),
    [guests]
  );
  const totalConfirmed = useMemo(
    () =>
      confirmingGuests.reduce(
        (sum, g) => sum + (Number(g.numberOfGuests) || 0),
        0
      ),
    [confirmingGuests]
  );

  const galleryImages = [
    {
      src: "/images/couple-hero.webp",
      alt: "Juan and Marina wedding portrait",
    },
    {
      src: "/images/couple-hero1.webp",
      alt: "Juan and Marina wedding portrait",
    },
    {
      src: "/images/couple-hero2.webp",
      alt: "Juan and Marina wedding portrait",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
      <MusicPlayer />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-60 h-60 sm:w-80 sm:h-80 bg-secondary/15 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-32 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-accent/8 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10">
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12 sm:py-16">
          <div className="max-w-3xl w-full text-center space-y-6 sm:space-y-10">
            <div className="flex justify-center">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary fill-primary animate-pulse" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-primary text-balance">
                Juan & Marina
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-primary/70 font-light tracking-widest">
                Together with their families
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-lg sm:text-xl md:text-2xl font-light text-primary">Juan</p>
                <p className="text-xs sm:text-sm md:text-base text-foreground/70 font-light">
                  The first son of <br className="sm:hidden" />
                  <span className="font-medium text-foreground/80">Mr. Joventius Delima</span> &amp;
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> </span>
                  <span className="font-medium text-foreground/80">Mrs. Roosye L Leander</span>
                </p>
              </div>
              <div className="flex justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary/40" />
              </div>
              <div className="space-y-2">
                <p className="text-lg sm:text-xl md:text-2xl font-light text-primary">Marina</p>
                <p className="text-xs sm:text-sm md:text-base text-foreground/70 font-light">
                  The youngest daughter of <br className="sm:hidden" />
                  <span className="font-medium text-foreground/80">Mr. Yanto Limong</span> &amp;
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> </span>
                  <span className="font-medium text-foreground/80">Mrs. Yeni Pitoy</span> (✞)
                </p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-16 border border-white/60 shadow-lg space-y-6 sm:space-y-8">
              <p className="text-base sm:text-lg md:text-xl font-light text-foreground/80">
                Request the honour of your presence
              </p>

              <div className="py-6 sm:py-8 border-t-2 border-b-2 border-white/30">
                <p className="text-3xl sm:text-4xl md:text-5xl font-light text-primary mb-2 sm:mb-3">
                  Holy Matrimony
                </p>
                <p className="text-sm sm:text-base text-foreground/70">
                  as they begin their new chapter together
                </p>
              </div>

              <div className="py-4 sm:py-6 md:py-8">
                <ImageGallery
                  images={galleryImages}
                  autoPlay={true}
                  autoPlayInterval={5000}
                />
              </div>

              <div className="space-y-4 sm:space-y-6 text-foreground/75">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 text-primary text-base sm:text-lg">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-medium">6 December 2025</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/60">
                      Saturday
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-white/30"></div>
                  <div className="sm:hidden w-8 h-px bg-white/30"></div>
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 text-primary text-base sm:text-lg">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-medium">11:00 AM</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/60">
                      Morning
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  <a
                    href="https://www.google.com/maps/dir//SEDAYU+CITY+SUITE+LIFE,+GROUND+FLOOR,+Jl.+Sedayu+City+Klp.+Gading+Jl.+Boulevard+Timur,+Kec.+Cakung,+Daerah+Khusus+Ibukota+Jakarta/@-6.1694296,106.8388879,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x2e69f5310b8160b1:0x1250cda4b54a5b4e!2m2!1d106.9213444!2d-6.1694461?entry=ttu&g_ep=EgoyMDI1MTExMi4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <p className="font-semibold text-base sm:text-lg hover:text-primary/80">
                      HAKA Restaurant
                    </p>
                    <p className="text-sm sm:text-base text-foreground/60 hover:text-foreground/80">
                      Sedayu City
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              {/* <GuestCounter totalConfirmed={totalConfirmed} totalResponses={confirmingGuests.length} /> */}
            </div>

            <div className="flex justify-center">
              <GiftCard />
            </div>

            <button
              onClick={() => setShowGuestList(!showGuestList)}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white/40 hover:bg-white/60 border-2 border-white/50 rounded-2xl text-primary font-semibold text-base sm:text-lg transition-all duration-300 backdrop-blur-sm hover:shadow-md"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">
                {showGuestList ? "Sembunyikan" : "Lihat"} Daftar Tamu
              </span>
              <span className="sm:hidden">
                {showGuestList ? "Sembunyikan" : "Lihat"}
              </span>
            </button>

            {error && <div className="text-sm text-accent">{error}</div>}

            {showGuestList && <GuestList />}
          </div>
        </section>

        <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-transparent via-white/5 to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-14 space-y-2 sm:space-y-3">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-light text-primary text-balance">
                Konfirmasi Kehadiran
              </h2>
              <p className="text-foreground/70 font-light text-base sm:text-lg md:text-xl">
                Silakan isi form di bawah untuk mengkonfirmasi kehadiran Anda di
                hari spesial kami
              </p>
            </div>
            <RSVPForm
              onSubmit={handleAddGuest}
              totalConfirmed={totalConfirmed}
            />
          </div>
        </section>

        <footer className="py-12 sm:py-16 px-4 sm:px-6 text-center text-sm sm:text-base text-foreground/60 border-t border-border">
          <p className="font-light text-base sm:text-lg">Created With 🩷</p>
          <p className="text-xs sm:text-sm mt-3 text-foreground/50">
            Juan & Marina
          </p>
        </footer>
      </div>
    </div>
  );
}
