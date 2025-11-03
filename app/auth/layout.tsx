export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Remove paragraph from layout later
  return (
    <body>
      <p className="text-error hidden">Auth Layout</p>
      <div className="border-red-500 border-1 grid grid-cols-[16rem_1fr] h-dvh">
        <menu className="w-full bg-blue-500">
          <ul>
            <li>Dashboard</li>
            <li>Profile</li>
          </ul>
        </menu>
        <div className="bg-purple-500 overflow-y-scroll grid grid-rows-[1fr_3rem]">
          {children}
          <footer className="bg-green-500">Footer</footer>
        </div>
      </div>
    </body>
  );
}
