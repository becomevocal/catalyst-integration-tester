import { cn } from '~/lib/utils';

interface Props {
  containerClassName?: string;
  contentClassName?: string;
  title: string;
  content: string;
}

export const PageContent = ({ containerClassName, contentClassName, content, title }: Props) => {
  return (
    <div className={cn('mx-auto mb-10 flex flex-col justify-center gap-8 lg:w-2/3', containerClassName)}>
      <h1 className="px-0 mx-auto text-5xl font-normal text-center mt-24">{title}</h1>
      <div className={contentClassName} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
