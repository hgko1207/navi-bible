import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PwaInstallHint from "@/components/PwaInstallHint";
import { SettingsProvider } from "@/hooks/useSettings";

export const metadata: Metadata = {
  title: "내비따라성경읽기",
  description: "1년 3독 성경읽기 가이드 - 매일 말씀 요약과 음원을 한곳에서",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "내비성경",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f6f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("navi-bible-settings");if(s){var t=JSON.parse(s).theme;if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <SettingsProvider>
          <div className="mx-auto min-h-dvh max-w-lg">
            <header className="sticky top-0 z-40 px-5 pb-2 pt-4 backdrop-blur-xl" style={{ background: `linear-gradient(to bottom, var(--header-bg), var(--header-bg), var(--header-bg-transparent))` }}>
              <div className="flex items-center justify-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-200/50 dark:shadow-amber-900/40">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[17px] font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    내비따라<span className="text-amber-600">성경</span>읽기
                  </h1>
                </div>
              </div>
            </header>
            <main className="px-4 pt-2 pb-5">{children}</main>
            <BottomNav />
            <ServiceWorkerRegister />
            <PwaInstallHint />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
