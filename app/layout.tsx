import type { Metadata } from "next";
import { Montserrat, Fira_Code } from "next/font/google";
import "./styles/globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "./components/theme-provider";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Producer Social Feed",
  description: "A social feed for producers built with Supabase & GraphQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${firaCode.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
