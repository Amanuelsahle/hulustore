import AdminPage from "@/components/admin-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Hulu Store",
  description: "Manage and update Hulu Store Shein delivery package statuses.",
};

export default function Page() {
  return <AdminPage />;
}
