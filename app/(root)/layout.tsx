import { Metadata } from "next";

export default function NoAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body>
      <p className="text-error hidden">No Auth Layout</p>
      {children}
    </body>
  );
}
