import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Management Portal | Shore Nails Admin",
  description: "Private review administration dashboard for Shore Nails.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-ivory text-ink">{children}</div>;
}

