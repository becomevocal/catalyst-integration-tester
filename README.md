<a href="https://catalyst.dev" target="_blank" rel="noopener norerrer">
  <img src="https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_banner.png" alt="Catalyst for Composable Commerce Image Banner" title="Catalyst">
</a>

<br />

**Catalyst** is the composable, fully customizable headless ecommerce storefront framework for
[BigCommerce](https://www.bigcommerce.com/). Catalyst is built with [Next.js](https://nextjs.org/), uses
our [React](https://react.dev/) storefront components, and is backed by the
[GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).

By choosing Catalyst, you'll have a fully-functional storefront within a few seconds, and spend zero time on wiring
up APIs or building SEO, Accessibility, and Performance-optimized ecommerce components you've probably written many
times before. You can instead go straight to work building your brand and making this your own.

<div align="center">

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

</div>

<p align="center">
 <a href="https://www.catalyst.dev">🚀 catalyst.dev</a> •
 <a href="https://developer.bigcommerce.com/community">🤗 BigCommerce Developer Community</a> •
 <a href="https://github.com/bigcommerce/catalyst/discussions">💬 GitHub Discussions</a>
</p>

<div align="center">

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

</div>

## Deploy w/ WP Integration

**Gutenberg w/ on-the-fly conversion to Tailwind CSS**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbecomevocal%2Fcatalyst-integration-tester&env=AUTH_SECRET,BIGCOMMERCE_STORE_HASH,BIGCOMMERCE_CHANNEL_ID,BIGCOMMERCE_ACCESS_TOKEN,BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN,ENABLE_ADMIN_ROUTE,NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET,WORDPRESS_GRAPHQL_ENDPOINT&install-command=npm%20run%20initialize%20--integration=wordpress-gutenberg-to-tailwind)

**Elementor w/ fetch of site scripts and styles**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbecomevocal%2Fcatalyst-integration-tester&env=AUTH_SECRET,BIGCOMMERCE_STORE_HASH,BIGCOMMERCE_CHANNEL_ID,BIGCOMMERCE_ACCESS_TOKEN,BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN,ENABLE_ADMIN_ROUTE,NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET,WORDPRESS_GRAPHQL_ENDPOINT&install-command=npm%20run%20initialize%20--integration=wordpress-elementor-site-fetch)

## Requirements

- Node.js 20+
- `npm` (or `pnpm`/`yarn`)

## Getting started

If this installation of Catalyst was created using the `catalyst` CLI, you should already be connected to a store and can get started immediately by running:

```shell
npm run dev
```

If you want to connect to another store or channel, you can run the setup process again by running:

```shell
npx @bigcommerce/create-catalyst@latest init
```

Learn more about Catalyst at [catalyst.dev](https://catalyst.dev).

## Resources

- [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
- [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
- [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)
