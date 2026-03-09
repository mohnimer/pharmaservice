import './globals.css';

export const metadata = {
  title: 'Pharma Service Co. LLC | 40 Years of Pharmaceutical Excellence',
  description: 'Full-spectrum pharmaceutical distribution across the UAE and GCC. Licensed importer, registered distributor, and strategic partner since 1984. Dubai Healthcare City.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/agrandir" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
