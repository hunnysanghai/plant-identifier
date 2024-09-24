import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plant Identifier",
  description: "Identify plants and learn how to care for them",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
