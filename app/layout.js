import './globals.css'
import { Inter } from 'next/font/google'
import { DataProvider } from '@/components/services/useDataSource';

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
        <meta name="google-site-verification" content="a7ZIZnWzVsOsNdeLOROb_OK2rRS1jDksIqbbQmo5sf0" />      </head>

      <body className={inter.className}>
      <DataProvider>{children}</DataProvider>

      </body>
    </html>
  )
}
