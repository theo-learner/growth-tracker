import type { Metadata, Viewport } from "next";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "🌱 AI 성장 트래커",
  description: "매일 2분의 기록으로, 우리 아이 발달의 큰 그림을 그리다",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "성장 트래커",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7CB587",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-pretendard antialiased bg-warm-beige text-dark-gray min-h-screen">
        <ClientErrorBoundary>
          <div className="max-w-[430px] mx-auto min-h-screen relative">
            {children}
          </div>
        </ClientErrorBoundary>
        {/* Service Worker 등록 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
