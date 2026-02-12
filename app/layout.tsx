import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
