export const metadata = {
  title: 'ÜNDER — Underground Fashion',
  description: 'Discover the most beautiful underground fashion brands from 30+ countries.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#050505" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#050505' }}>
        {children}
      </body>
    </html>
  );
}