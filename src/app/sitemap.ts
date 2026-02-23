import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://utils.ilyasbozdemir.com'; // Change to actual production URL if known
  const lastModified = new Date();

  // List of tools extracted from LandingHero.tsx (ToolView type)
  const tools = [
    'convert', 'inspect', 'base64', 'optimize', 'hash', 'json', 'text', 'pdf', 'exif', 'qr',
    'social', 'favicon', 'units', 'encrypt', 'uuid', 'yaml', 'jwt', 'url', 'imagetopdf', 'case', 'string',
    'json-xml', 'date-time', 'sql-formatter', 'word-pdf', 'pdf-word', 'excel-pdf', 'pdf-excel', 'ppt-pdf',
    'pdf-ppt', 'pdf-image', 'pdf-split', 'word-html', 'pdf-text', 'web-toolkit', 'network-toolkit', 'color-toolkit',
    'regex-tester', 'csv-viewer', 'markdown-editor', 'password-generator', 'svg-optimizer', 'cron-builder',
    'timezone-converter', 'json-ld', 'network-cable', 'lorem-ipsum', 'aspect-ratio', 'social-guide', 'http-status',
    'json-csv', 'text-cleaner', 'case-converter-pro', 'css-units', 'date-calculator', 'internet-speed',
    'iban-checker', 'tckn-checker', 'file-size-calc', 'viewport-calc', 'exif-viewer', 'bulk-rename',
    'email-header-analyzer', 'identifier-converter', 'schema-generator', 'metadata-generator', 'document-toolkit',
    'json-to-code', 'text-diff'
  ];

  const toolRoutes = tools.map((tool) => ({
    url: `${baseUrl}/#/${tool}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...toolRoutes,
  ];
}
