import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ProductBazar | Beyond The Launch - The Ecosystem for Products with a Story',
  description:
    'Join ProductBazar, the modern innovation platform where startups, makers, investors, and collaborators come together to grow what matters. Launch with context, track your journey, and connect with the people who will help you grow.',
  keywords:
    'product ecosystem, startup journey, innovation platform, product launch, startup growth, tech community, product discovery, startup validation, founder network, investor connections, product lifecycle, startup collaboration, tech innovation, product development, startup success',
  authors: [{ name: 'ProductBazar Team' }],
  creator: 'ProductBazar',
  publisher: 'ProductBazar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://productbazar.cyperstudio.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ProductBazar | Beyond The Launch - The Ecosystem for Products with a Story',
    description:
      'The ecosystem for products with a story. Launch with context, track your journey, and connect with the people who will help you grow. Join 3,000+ builders, investors & partners.',
    url: 'https://productbazar.cyperstudio.in',
    siteName: 'ProductBazar',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/apple-touch.png',
        width: 1200,
        height: 630,
        alt: 'ProductBazar - The Ecosystem for Products with a Story',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ProductBazar',
    creator: '@ProductBazar',
    title: 'ProductBazar | Beyond The Launch - The Ecosystem for Products with a Story',
    description: 'Join 3,000+ builders, investors & partners in the ecosystem for products with a story. Launch with context, track your journey, and grow.',
    images: ['/apple-touch.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  other: {
    'theme-color': '#7c3aed',
    'color-scheme': 'light',
  },
};

export default function RootLayout({ children }) {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ProductBazar",
    "description": "The ecosystem for products with a story. Launch with context, track your journey, and connect with the people who will help you grow.",
    "url": "https://productbazar.cyperstudio.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://productbazar.cyperstudio.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ProductBazar",
      "url": "https://productbazar.cyperstudio.in"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent browser extension hydration issues
              (function() {
                if (typeof window !== 'undefined') {
                  // Remove extension attributes immediately
                  const cleanupExtensions = () => {
                    document.querySelectorAll('[bis_skin_checked]').forEach(el => {
                      el.removeAttribute('bis_skin_checked');
                    });
                  };

                  // Clean on DOM ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', cleanupExtensions);
                  } else {
                    cleanupExtensions();
                  }
                }
              })();
            `
          }}
        />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://productbazar.cyperstudio.in" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/Assets/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/Assets/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/Assets/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/Assets/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/Assets/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/Assets/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/Assets/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/Assets/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/Assets/apple-touch-icon-57x57.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Assets/favicon-16x16.png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-TileImage" content="/Assets/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="application-name" content="ProductBazar" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ProductBazar" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance Optimizations */}
        <link rel="preload" href="/apple-touch.png" as="image" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-violet-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        
        <Providers>
          <main id="main-content" role="main">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
