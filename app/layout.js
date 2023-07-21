import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({ children }) {
  const GA_MEASUREMENT_ID = "G-LQ43L77QE0";
  const googleAnalyticsCode = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname,
    });
  `;
  return (
    <html lang="en">
       <head>
        <script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
        <script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: googleAnalyticsCode }}
        />
      </head>

      <body className={inter.className}>{children}</body>
    </html>
  )
}
