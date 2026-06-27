import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "같이사",
  description: "친구들과 같이 사고, 정산은 자동으로.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
