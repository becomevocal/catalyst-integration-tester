import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { WordPressBlocksRenderer } from '~/integrations/wordpress/server-components';
import { getWordPressPage } from '~/integrations/wordpress/data-fetcher';

interface Props {
  params: { page: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/${params.page}`;
  const webpage = await getWordPressPage({ path });

  if (!webpage) {
    notFound();
  }

  const { title } = webpage;

  return {
    title,
    description: "", //seo.metaDescription,
    keywords: "", //seo.metaKeywords,
  };
}

export default async function WebPage({ params: { locale, page } }: Props) {
  const path = `/${page}`;
  const webpage = await getWordPressPage({ path });

  if (!webpage) {
    notFound();
  }

  return <WordPressBlocksRenderer data={webpage.data.page} />
}

export const runtime = 'edge';
