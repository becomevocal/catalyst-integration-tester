import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageContent } from '../_components/page-content';
import { ElementorScriptReinitializer } from '../_components/elementor-script-handler';

import { getWordPressPage } from '~/integrations/wordpress-elementor-fetched/data-fetcher';

interface Props {
  params: { page: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/${params.page}`;
  const webpage = await getWordPressPage({ path });

  if (!webpage) {
    notFound();
  }

  const { title, excerpt } = webpage;

  return {
    title,
    // Strip html tags from excerpt before using it as meta description
    description: excerpt?.replace(/(<([^>]+)>)/gi, ''),
    keywords: '',
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
      <div className={`elementor-kit-${webpage.data.page.elementorKitId} mx-0 pl-0 sm:-mx-10 sm:pl-10 lg:-mx-12 lg:pl-12`}>
        <PageContent content={webpage.data.page.elementorContent} />
      </div>
    </>
  );
}

export const runtime = 'edge';
