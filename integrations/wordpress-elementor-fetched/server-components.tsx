import { PageContent } from '../../app/[locale]/(default)/(webpages)/_components/page-content';

export function WordPressBlocksRenderer({ data }: { data: any }) {
  let content = data.content;
  
  return (
    <PageContent
      content={content}
      title={data.title}
    />
  )
}
