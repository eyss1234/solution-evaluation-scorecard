import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { PawPrint } from "lucide-react";

export const metadata: Metadata = {
  title: "Solution Evaluation Scorecard",
  description: "POC for solution evaluation with gating questions and scorecard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
        <footer className="mt-auto py-4 text-center text-sm text-gray-600 border-t">
          <div className="flex items-center justify-center gap-1">
            <PawPrint size={16} />
            <span>Teddy Corp 2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
