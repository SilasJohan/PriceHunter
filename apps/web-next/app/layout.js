import "./globals.css"; // Certifique-se que o arquivo existe na pasta app

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}