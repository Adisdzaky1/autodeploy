// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Remove CDN Tailwind - we'll use proper Tailwind setup */}
      </Head>
      <body className="bg-dark-950 text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
