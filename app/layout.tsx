import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import FarcasterWrapper from "@/components/FarcasterWrapper";

const inter = Inter({ subsets: ['latin'] });

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

export const metadata: Metadata = {
        title: "PollCaster",
        description: "Create and vote on polls with PollCaster. Intuitive UI, instant results, and easy sharing on Farcaster. Supports guest users and runs directly in browsers. Fully responsive design.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_f6b279c8-458a-46db-afce-43c7dd24ff45-Sn01jjN4LF6t1gdMBXNJNxpyjL7Dqe","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"PollCaster","url":"https://whale-dug-206.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };
