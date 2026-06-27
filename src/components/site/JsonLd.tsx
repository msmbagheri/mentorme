/**
 * Renders one or more schema.org JSON-LD documents into the page.
 * Server component — emits a single <script type="application/ld+json">.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD payload is server-built from CMS data, not user HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
