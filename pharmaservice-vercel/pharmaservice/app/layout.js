import './globals.css';

export const metadata = {
  title: 'Products | Pharma Service Co.',
  description: 'Pharmacy Partner Programme — European Health Products in Stock',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/agrandir" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
