export default function StructuredData() {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Tassel & Wicker",
    "description": "Luxury wicker baskets and lifestyle essentials. Quality, aspirational, and timeless pieces for elevated living.",
    "url": "https://tasselandwicker.com",
    "logo": "https://tasselandwicker.com/tassel-and-wicker.svg",
    "image": "https://tasselandwicker.com/og-image.jpg",
    "telephone": "+1-555-123-4567",
    "email": "info@tasselandwicker.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://www.instagram.com/tasselandwicker",
      "https://www.pinterest.com/tasselandwicker"
    ],
    "priceRange": "$$",
    "paymentAccepted": "Credit Card, PayPal, Stripe",
    "currenciesAccepted": "USD",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Wicker Baskets and Lifestyle Items",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Wicker Baskets"
        },
        {
          "@type": "OfferCatalog",
          "name": "Lifestyle Essentials"
        }
      ]
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tassel & Wicker",
    "url": "https://tasselandwicker.com",
    "logo": "https://tasselandwicker.com/tassel-and-wicker.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "Customer Service",
      "email": "info@tasselandwicker.com",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://www.instagram.com/tasselandwicker",
      "https://www.pinterest.com/tasselandwicker"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}

