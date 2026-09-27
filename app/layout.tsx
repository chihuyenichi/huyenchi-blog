import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Be_Vietnam_Pro, Bebas_Neue, Bungee, Lora } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./typography.css";
import "./interactions.css";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-magic" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-word" });
const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-sans",
});
const lora = Lora({
  weight: ["600", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: { default: "Tech Notes", template: "%s | Tech Notes" },
  description: "Technical writeups from the CTF arena.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const bodyStyle = { "--site-background": `url("${basePath}/images-2/background-shadow.jpg")` } as CSSProperties;
  return (
    <html
      lang="vi"
      className={`${bungee.variable} ${bebas.variable} ${beVietnamPro.variable} ${lora.variable}`}
    >
      <body style={bodyStyle}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
