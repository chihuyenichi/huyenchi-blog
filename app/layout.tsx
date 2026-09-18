import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Cipher Notes", template: "%s | Cipher Notes" },
  description: "Technical writeups from the CTF arena.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const bodyStyle = { "--site-background": `url("${basePath}/images-2/background-shadow.jpg")` } as CSSProperties;
  return (
    <html lang="en">
      <body style={bodyStyle}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
