import type { Metadata } from "next";
import { DM_Sans, Lora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Preach - Church Preaching Web App",
  description: "Instant Bible verses for preaching. Search by keyword or verse reference and display verses for your congregation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var resolvedTheme = 'light';
                  
                  if (theme === 'dark') {
                    resolvedTheme = 'dark';
                  } else if (theme === 'light') {
                    resolvedTheme = 'light';
                  } else if (theme === 'system' || !theme) {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(resolvedTheme);
                  
                  if (resolvedTheme === 'dark') {
                    document.documentElement.style.setProperty('--background', 'oklch(0.2077 0.0398 265.7549)');
                    document.documentElement.style.setProperty('--foreground', 'oklch(0.8717 0.0093 258.3382)');
                  } else {
                    document.documentElement.style.setProperty('--background', 'oklch(0.9751 0.0127 244.2507)');
                    document.documentElement.style.setProperty('--foreground', 'oklch(0.3729 0.0306 259.7328)');
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${lora.variable} ${ibmPlexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
