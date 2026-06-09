import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dainik Jahan Global Edition",
  description: "A premium news portal replica of The Guardian with Gemini AI-powered news editing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        {/* DO NOT MODIFY THIS FOOTER - UI LOCKED BY USER */}
        <footer className="w-full border-t border-zinc-800 mt-12 py-10 px-4 text-center text-zinc-400 text-sm bg-slate-900">
          <div className="max-w-4xl mx-auto space-y-3">
            <p>This news portal is fully protected by this company's SIC code [XXXXX] and legally preserves all types of legal power of an international newspaper or international news portal publication.</p>
            <p><a href="mailto:info@dainikjahan.com" className="hover:text-zinc-200 transition-colors">info@dainikjahan.com</a></p>
            <div className="pt-6 mt-6 border-t border-zinc-800/50">
              <p>© 2026 UK School of Artificial Intelligence Limited</p>
              <p>128 City Road, London, United Kingdom</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
