import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qualms",
  description: "Sign in with GitHub to register repositories.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
