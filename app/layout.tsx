import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
                    document.documentElement.style.setProperty('--background', '#0a0a0a');
                    document.documentElement.style.setProperty('--foreground', '#ededed');
                  } else {
                    document.documentElement.style.setProperty('--background', '#ffffff');
                    document.documentElement.style.setProperty('--foreground', '#171717');
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
