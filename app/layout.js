import { Inter, Instrument_Serif, Archivo } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "800"], variable: "--font-sans" });
const heavy = Archivo({ subsets: ["latin"], weight: "variable", axes: ["wdth"], variable: "--font-heavy" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });

export const metadata = {
  title: "Pankaj Kumar Sharma, Founder & Systems Architect",
  description:
    "Pankaj Kumar Sharma, Founder, CEO & Director of DFORR Pvt. Ltd. in Jaipur. Living 3D worlds, edge AI and personal AI companions.",
};

export const viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${heavy.variable}`}>
      <body>{children}</body>
    </html>
  );
}
