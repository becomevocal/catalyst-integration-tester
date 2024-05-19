import { cn } from '~/lib/utils';

interface Props {
  containerClassName?: string;
  contentClassName?: string;
  content: string;
}

export const PageContent = ({ containerClassName, contentClassName, content }: Props) => {
  return (
    <div className={cn('mx-auto mb-10 flex flex-col justify-center gap-8 !w-screen mx-0 sm:-mx-10 lg:-mx-12', containerClassName)}>
      <div className={contentClassName} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
