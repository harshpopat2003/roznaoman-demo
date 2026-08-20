import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Instrument_Serif, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

/* Instrument Serif is one weight and very high contrast — it reads like
   a sign cut into something rather than like a typeface, which is the
   whole register this site is in. */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

/* Every drawn element — room numbers, plaques, the plan — is set in
   mono, so the survey never gets confused with the building. */
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-kufi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rozna — a fort in Muscat that serves lunch",
  description:
    "Walk through Rozna room by room: the gate, the courtyard, the table, Al Sabla and the culinary institute. Authentic Omani cuisine in Muscat, open daily 8:00 AM — 11:30 PM.",
  openGraph: {
    title: "Rozna — a fort in Muscat that serves lunch",
    description: "Eight rooms, one gate. Omani cuisine cooked the way it has always been cooked.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${dmSans.variable} ${dmMono.variable} ${kufi.variable}`}
    >
      <body>
        {/* The pointed arch from the Rozna mark, defined once and used as
            a mask wherever a doorway appears. Bounding-box units, so the
            one path fits every aspect ratio it is put on. */}
        <svg width="0" height="0" aria-hidden focusable="false" className="absolute">
          <defs>
            <clipPath id="rozna-arch" clipPathUnits="objectBoundingBox">
              <path d="M0,1 L0,0.4714 C0,0.2429 0.2,0.0714 0.5,0 C0.8,0.0714 1,0.2429 1,0.4714 L1,1 Z" />
            </clipPath>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
