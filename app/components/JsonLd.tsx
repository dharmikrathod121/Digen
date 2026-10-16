export default function JsonLd() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Digen',
    url: 'https://digen.vercel.app',
    logo: 'https://digen.vercel.app/logo.png',
    description: 'AI-powered diagram generator built from system thinking.',
    foundingDate: '2025',
    founders: [{ '@type': 'Person', name: 'Dharmik Rathod', url: 'https://github.com/dharmikrathod21' }],
    sameAs: [
      'https://github.com/dharmikrathod21/Digen',
      'https://github.com/dharmikrathod21',
      'https://www.linkedin.com/in/iamdharmikrathod/',
      'https://www.youtube.com/@IamDharmikRathod',
    ],
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Dharmik Rathod',
    url: 'https://github.com/dharmikrathod21',
    jobTitle: 'AI Product Engineer',
    description: 'AI-Native Systems Builder specializing in LLM fine-tuning, SEO-driven systems, and AI agent development.',
    address: { '@type': 'PostalAddress', addressLocality: 'Rajkot', addressRegion: 'Gujarat', addressCountry: 'IN' },
    email: 'dharmikrathod121@gmail.com',
    telephone: '+91-9023504151',
    sameAs: [
      'https://github.com/dharmikrathod21',
      'https://www.linkedin.com/in/iamdharmikrathod/',
      'https://www.youtube.com/@IamDharmikRathod',
      'https://dharmikrathod.netlify.app',
    ],
  };

  const app = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Digen',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: 'AI-powered diagram generator that produces copy-ready Mermaid diagrams from plain English prompts.',
    url: 'https://digen.vercel.app',
    author: { '@type': 'Person', name: 'Dharmik Rathod', url: 'https://github.com/dharmikrathod21' },
    programmingLanguage: ['TypeScript', 'React', 'Next.js'],
    softwareVersion: '0.1.0',
    releaseNotes: 'Initial release with Mermaid-based diagram generation via OpenRouter.',
    screenshot: 'https://digen.vercel.app/og.png',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digen.vercel.app' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
