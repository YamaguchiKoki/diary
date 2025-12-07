import type { Metadata } from "next";
import { LightRays } from "@/components/ui/LightRays";
import "./globals.css";
import { MenuContent } from "@/components/ui/MenuItem";
import { SideMenu } from "@/components/ui/SideMenu";

export const metadata: Metadata = {
  title: "Sanbun",
  description: "散文投稿します",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="relative min-h-screen bg-white">
        <div
          className="fixed inset-0 -z-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.01) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.01) 1px, transparent 1px)
            `,
            backgroundSize: "16px 16px",
          }}
        />
        <LightRays
          className="fixed inset-0 -z-10"
          count={7}
          color="rgba(30, 64, 175, 0.3)"
          blur={36}
          speed={14}
          length="70vh"
        />
        <div className="lg:flex">
          <SideMenu>
            <MenuContent />
          </SideMenu>
          <div className="flex flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
