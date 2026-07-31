import type { Metadata } from "next";
import "./globals.css";
import { OrdersProvider } from "@/context/orders-context";

export const metadata: Metadata = {
  title: "Hulu Store — Shein Delivery in Addis Ababa",
  description: "Track your Shein orders with real-time updates and local delivery in Addis Ababa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <OrdersProvider>{children}</OrdersProvider>
      </body>
    </html>
  );
}

