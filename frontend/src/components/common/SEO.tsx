import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  noIndex?: boolean; 
}

export default function SEO({
  title,
  description,
  url,
  image,
  noIndex = false,
}: SEOProps) {
  const defaultTitle = "Appointment System";
  const defaultDescription = "Manage appointments and visitors efficiently";
  const defaultUrl = "https://yourdomain.com";
  const defaultImage = "/default-og-image.png";

  return (
    <Head>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title || defaultTitle} />
      <meta
        property="og:description"
        content={description || defaultDescription}
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || defaultUrl} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta
        name="twitter:description"
        content={description || defaultDescription}
      />
      <meta name="twitter:image" content={image || defaultImage} />
    </Head>
  );
}
