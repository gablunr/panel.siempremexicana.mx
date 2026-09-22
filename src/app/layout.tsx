import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import "@/styles/globals.css"

const sfPro = localFont({
  src: [
    { path: "../styles/fonts/SF-Pro-Text-Regular.woff2", weight: "400", style: "normal" },
    { path: "../styles/fonts/SF-Pro-Text-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "../styles/fonts/SF-Pro-Text-Medium.woff2", weight: "500", style: "normal" },
    { path: "../styles/fonts/SF-Pro-Text-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../styles/fonts/SF-Pro-Text-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Panel de Siempre Mexicana",
    template: "%s | Panel de Siempre Mexicana",
  },
  description: "Artículos del blog y solicitudes de cotización de siempremexicana.mx.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={cn("font-sans", sfPro.variable)}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
