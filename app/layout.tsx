import type { Metadata } from "next";
import "./ui/globals.css";
import "./ui/reset.css";
import localFont from "next/font/local";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const sb = localFont({
  src: [
    {
      path: "./ui/fonts/SB-light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./ui/fonts/SB-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./ui/fonts/SB-bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./ui/fonts/SB-light-window.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./ui/fonts/SB-medium-window.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./ui/fonts/SB-bold-window.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sb.className}>
        <header className="py-4 bg-gray-800">
          <div className="max-w-[1200px] mx-auto text-lg">
            <h1 className="text-white">
              <Link href={"./"} className="pl-6">
                머리
              </Link>
            </h1>
          </div>
        </header>
        {children}
      </body>
      {/* Pretendard test */}
      {/* <body className={pretendard.className}>{children}</body> */}
    </html>
  );
}
