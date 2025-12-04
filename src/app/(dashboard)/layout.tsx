import { Metadata } from "next";

import { GlobalNav } from "@/components/global/nav";

export const metadata: Metadata = {
  title: {
    default: "Gestion RAD",
    template: "%s | Gestion RAD",
  },
  icons: {
    icon: "/imgs/logo.png",
  },
  description: "Gestion RAD. A dashboard for Gestion RAD.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalNav />
      <div className="lg:pl-72">{children}</div>
    </>
  );
}
