import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./sections.css";

// Fonts ship with the site (app/fonts) so builds never depend on reaching Google Fonts.
const inter = localFont({ src: "./fonts/inter-var.woff2", weight: "100 900", variable: "--font-sans", display: "swap" });
const heavy = localFont({
  src: "./fonts/archivo-var.woff2",
  weight: "100 900",
  variable: "--font-heavy",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
const serif = localFont({
  src: [
    { path: "./fonts/instrument-serif.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

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
