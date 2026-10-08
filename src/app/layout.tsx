import './globals.css'; // 👈 MUST BE PRESENT

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F2F2F7] dark:bg-[#000000] text-gray-900 dark:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}