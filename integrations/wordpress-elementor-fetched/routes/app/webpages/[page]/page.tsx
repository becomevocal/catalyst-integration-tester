import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { WordPressBlocksRenderer } from '~/integrations/wordpress-elementor-fetched/server-components';
import { getWordPressPage } from '~/integrations/wordpress-elementor-fetched/data-fetcher';

import { ElementorScriptReinitializer } from '../_components/elementor-script-handler';

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
    description: '', //seo.metaDescription,
    keywords: '', //seo.metaKeywords,
  };
}

export default async function WebPage({ params: { locale, page } }: Props) {
  const path = `/${page}`;
  const webpage = await getWordPressPage({ path });

  if (!webpage) {
    notFound();
  }

  return (
    <>
      <ElementorScriptReinitializer />
      <div
        className={`elementor-kit-${webpage.data.page.elementorKitId} mx-0 pl-0 sm:-mx-10 sm:pl-10 lg:-mx-12 lg:pl-12`}
      >
        <WordPressBlocksRenderer data={webpage.data.page} />
      </div>
    </>
  );
}

export const runtime = 'edge';
