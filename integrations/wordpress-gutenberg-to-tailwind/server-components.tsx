import { PageContent } from '../../app/[locale]/(default)/(webpages)/_components/page-content';

export function WordPressBlocksRenderer({ data }: { data: any }) {
  const isLayoutContrainedCSS = "[&>:where(:not(.alignleft):not(.alignright):not(.alignfull))]:max-w-[620px] [&>:where(:not(.alignleft):not(.alignright):not(.alignfull))]:mx-auto [&>:is(.alignwide)]:max-w-full";

  const originalClassesToTailwindMap = [
    { from: "has-x-large-font-size", to: "text-[length:var(--wp--preset--font-size--x-large)]" },
    { from: "has-medium-font-size", to: "!text-[length:var(--wp--preset--font-size--medium)]" },
    { from: "has-text-align-center is-style-asterisk", to: "has-text-align-center is-style-asterisk before:mx-auto" },
    { from: "is-style-rounded", to: "rounded-spacing-20 overflow-hidden" },
    { from: "wp-block-group", to: "box-border" },
    { from: "wp-block-navigation .wp-block-page-list", to: "flex flex-wrap items-[var(--navigation-layout-align,initial)] justify-[var(--navigation-layout-justify,initial)] bg-inherit" },
    { from: "wp-block-navigation .wp-block-navigation-item", to: "bg-inherit" },
    { from: "wp-block-post-title", to: "box-border break-words" },
    { from: "wp-block-post-title a", to: "inline-block" },
    { from: "wp-block-post-featured-image", to: "relative mx-0" },
    { from: "wp-block-post-featured-image a", to: "block h-full" },
    { from: "wp-block-post-featured-image img", to: "box-border h-auto max-w-full w-full align-bottom" },
    { from: "wp-block-heading", to: "leading-[1.2]" },
    { from: "wp-block-paragraph", to: "spacing-y-4" },
    { from: "wp-block-columns", to: "flex flex-nowrap items-center mx-auto mb-6 max-w-screen-xl leading-7 md:flex-nowrap !items-start [margin-block-start:1.2rem]" },
    { from: "wp-container-core-columns-is-layout-1", to: "gap-[var(--wp--preset--spacing--30)_var(--wp--preset--spacing--40)]" },
    { from: "wp-container-core-columns-is-layout-2", to: "gap-[var(--wp--preset--spacing--30)_var(--wp--preset--spacing--40)]" },
    { from: "wp-container-core-columns-is-layout-3", to: "gap-[var(--wp--preset--spacing--50)_var(--wp--preset--spacing--60)]" },
    { from: "wp-container-core-columns-is-layout-4", to: "gap-[var(--wp--preset--spacing--50)_var(--wp--preset--spacing--60)]" },
    { from: "alignwide", to: "alignwide max-w-7xl" },
    { from: "has-text-align-left", to: "max-w-7xl" },
    { from: "wp-block-column", to: "m-0 min-w-0 break-word basis-0 grow" },  
    { from: "wp-block-list", to: "box-border" },
    { from: "wp-block-separator", to: "border-none border-t-[2px] solid" },
    { from: "wp-block-post-template", to: "list-none mb-0 mt-0 max-w-full p-0" },
    { from: "wp-block-query-pagination", to: "flex-wrap" },
    { from: "has-global-padding", to: "px-[var(--wp--style--root--padding-left)] py-[var(--wp--style--root--padding-top)] .has-global-padding:not(.wp-block-block) [&>:where(:not(.wp-block-block))]:px-0" },
    { from: "wp-block-group-is-layout-constrained", to: "mx-auto" },
    { from: "has-text-align-center", to: "text-center" },
    { from: "wp-block-buttons", to: "flex justify-center" },
    { from: "is-content-justification-center", to: "justify-center" },
    { from: "is-layout-flex", to: "flex flex-wrap items-center" },
    { from: "wp-container-core-columns-is-layout-5", to: "gap-[var(--wp--preset--spacing--50)_var(--wp--preset--spacing--60)]" },
    { from: "wp-container-core-group-is-layout-3", to: "gap-0 flex-col items-center" },
    { from: "wp-container-core-group-is-layout-8", to: "flex-nowrap gap-0 flex-col items-center" },
    { from: "wp-container-core-group-is-layout-9", to: "gap-0 flex-col items-center" },
    { from: "wp-container-core-group-is-layout-11", to: "gap-4 flex-col items-center" },
    { from: "wp-container-content-3", to: "basis-5" },
    { from: "wp-container-content-4", to: "basis-5" },
    { from: "wp-container-content-12", to: "basis-5" },
    { from: "wp-block-spacer", to: "clear-both" },
    { from: "wp-block-buttons-is-layout-flex", to: "flex gap-3 [margin-block-start:1.2rem]" },
    { from: "wp-block-button", to: "inline-block" },
    { from: "wp-element-button", to: "bg-[color:var(--wp--preset--color--contrast)] border-[color:var(--wp--preset--color--contrast)] text-[color:var(--wp--preset--color--base)] text-[length:var(--wp--preset--font-size--small)] not-italic font-medium leading-[inherit] no-underline px-4 py-[0.6rem] rounded-[0.33rem] border-0 cursor-pointer hover:bg-[color:var(--wp--preset--color--contrast-2)] hover:border-[color:var(--wp--preset--color--contrast-2)] hover:text-[color:var(--wp--preset--color--base)]" },
    { from: "is-style-checkmark-list", to: "pl-[var(--wp--preset--spacing--10)] list-['✓'] [&>:where(li)]:ps-2" },
    { from: "is-layout-flow", to: "[&_p]:mt-4 [&_ul]:mt-4 [&_ol]:mt-4" },
    { from: "wp-block-quote", to: "p-12 mx-auto text-3xl italic break-words bg-white rounded-3xl text-neutral-900" },
    { from: "has-heading-font-family", to: "font-serif" },
    { from: "has-base-color", to: "text-[color:var(--wp--preset--color--base)]" },
    { from: "has-base-2-color", to: "text-[color:var(--wp--preset--color--base-2)]" },
    { from: "has-base-2-background-color", to: "bg-[color:var(--wp--preset--color--base-2)]" },
    { from: "has-contrast-background-color", to: "bg-[color:var(--wp--preset--color--contrast)]" },
    { from: "is-vertically-aligned-center", to: "self-center" },
    { from: "is-layout-constrained", to: isLayoutContrainedCSS },
  ];

  let content = data.content;
  originalClassesToTailwindMap.forEach((translate) => {
    content = content.replaceAll(`${translate.from} `, `${translate.to} `)
    content = content.replaceAll(`"${translate.from} `, `"${translate.to} `)
    content = content.replaceAll(` ${translate.from}"`, ` ${translate.to}"`)
    content = content.replaceAll(`"${translate.from}"`, `"${translate.to}"`)
  })
  
  return (
    <PageContent
      content={content}
      title={data.title}
      containerClassName="!w-screen mx-0 sm:-mx-10 lg:-mx-12"
      contentClassName={isLayoutContrainedCSS}
    />
  )
}
