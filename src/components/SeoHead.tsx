import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  articleData?: any;
}

export default function SeoHead({ title, description, image, url, type = 'website', articleData }: SeoHeadProps) {
  const [seoSettings, setSeoSettings] = useState<any>(null);
  const [generalSettings, setGeneralSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const seoDoc = await getDoc(doc(db, 'settings', 'seo'));
        if (seoDoc.exists()) {
          setSeoSettings(seoDoc.data());
        }
        const generalDoc = await getDoc(doc(db, 'settings', 'general'));
        if (generalDoc.exists()) {
          setGeneralSettings(generalDoc.data());
        }
      } catch (error) {
        console.error("Error fetching SEO settings:", error);
      }
    };
    fetchSettings();
  }, []);

  if (!seoSettings || !generalSettings) return null;

  const siteName = generalSettings.siteName || 'TechDaily Pulse';
  const finalTitle = title ? `${title} | ${siteName}` : (seoSettings.ogTitle || siteName);
  const finalDescription = description || seoSettings.ogDescription || '';
  const finalImage = image || seoSettings.ogImage || '';
  const finalUrl = url || seoSettings.canonicalUrl || window.location.href;
  const twitterCard = seoSettings.twitterCardType || 'summary_large_image';
  const noIndex = seoSettings.noIndexGlobal;

  // Schema Markup
  const schemaType = seoSettings.schemaSiteType || 'NewsMediaOrganization';
  const schemaLogo = seoSettings.schemaLogo || '';
  
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": siteName,
    "url": seoSettings.canonicalUrl || window.location.origin,
    "logo": schemaLogo,
    "sameAs": [
      generalSettings.facebookUrl,
      generalSettings.twitterUrl,
      generalSettings.instagramUrl,
      generalSettings.linkedinUrl
    ].filter(Boolean)
  };

  let articleSchema = null;
  if (type === 'article' && articleData) {
    articleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": articleData.seo?.seoTitle || articleData.title,
      "image": [
        articleData.image
      ],
      "datePublished": articleData.createdAt?.toDate ? articleData.createdAt.toDate().toISOString() : new Date().toISOString(),
      "author": [{
          "@type": "Person",
          "name": articleData.author
      }]
    };
  }

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {finalUrl && <link rel="canonical" href={finalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      {finalImage && <meta property="og:image" content={finalImage} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {finalImage && <meta name="twitter:image" content={finalImage} />}

      {/* Verification & Tracking */}
      {seoSettings.googleSiteVerification && (
        <meta name="google-site-verification" content={seoSettings.googleSiteVerification.replace(/<meta name="google-site-verification" content="(.*)" \/>/, '$1')} />
      )}

      {/* Preconnects */}
      {seoSettings.preconnectUrls && seoSettings.preconnectUrls.split('\n').map((pUrl: string, i: number) => {
        const trimmed = pUrl.trim();
        if (!trimmed) return null;
        return <link key={i} rel="preconnect" href={trimmed} crossOrigin="anonymous" />;
      })}

      {/* Facebook Pixel */}
      {seoSettings.facebookPixelId && (
        <script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${seoSettings.facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </script>
      )}
      {seoSettings.facebookPixelId && (
        <noscript>
          {`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${seoSettings.facebookPixelId}&ev=PageView&noscript=1" />`}
        </noscript>
      )}

      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(baseSchema)}
      </script>
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
}
