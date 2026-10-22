import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'NetWatch | Speed Test', description: 'Đo tốc độ Internet trực tiếp trong trình duyệt' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="vi"><body>{children}</body></html>; }
