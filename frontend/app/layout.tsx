import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "HackFlow AI",
  description: "Team workflow assistant"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
