import './global.css';

export const metadata = {
  title: 'Daybook',
  description: 'Notes, daily plan, weekly plan and projects in one app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
