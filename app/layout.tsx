import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // ✅ This is the correct path
import Script from 'next/script';
import FarcasterWrapper from "@/components/FarcasterWrapper";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "PollCaster",
  description: "Create and vote on polls with PollCaster.",
  other: { 
    "fc:frame": JSON.stringify({
      "version":"next",
      "imageUrl":"https://picsum.photos/seed/pollcaster/600/400.jpg",
      "button":{
        "title":"Open PollCaster",
        "action":{
          "type":"launch_frame",
          "name":"PollCaster",
          "url":"https://castpoll.vercel.app",
          "splashImageUrl":"https://picsum.photos/seed/pollcaster/1200/800.jpg",
          "splashBackgroundColor":"#1a1b26"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/farcaster-miniapp-sdk@0.1.5/dist/sdk.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <FarcasterWrapper>
          {children}
        </FarcasterWrapper>
      </body>
    </html>
  );
}
