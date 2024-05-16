export async function getWordPressPosts(searchParams: PostsListParams) {
  const { tagId, limit = 9, before, after, locale = 'en' } = searchParams;
  const filterArgs = tagId ? { tagSlugIn: [tagId] } : {};
  const paginationArgs = before ? { last: limit, before } : { first: limit, after };

  const apiResponse = await fetchWordPressData({
    query: `query Posts(
      $tagSlugIn: [String]
      $after: String
      $before: String
      $first: Int
      $last: Int
    ) {
      posts(first: $first, after: $after, last: $last, before: $before, where: { tagSlugIn: $tagSlugIn }) {
        edges {
          node {
            slug
            title
            id
            content
            dateGmt
            excerpt
            author {
              node {
                firstName
                lastName
              }
            }
            featuredImage {
              node {
                sourceUrl(size: MEDIUM)
                mediaItemUrl
                altText
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }`,
    variables: { ...filterArgs, ...paginationArgs },
  });

  if (!apiResponse) {
    return null;
  }

  return transformDataToBlogPosts(apiResponse, tagId);
}

export async function getWordPressPost(postParams: SinglePostParams) {
  const { blogId, locale = 'en' } = postParams;

  const apiResponse = await fetchWordPressData({
    query: `query Post($slug: ID!) {
      post(id: $slug, idType: SLUG) {
          slug
          title
          id
          content
          dateGmt
          excerpt
          author {
            node {
                firstName
                lastName
            }
          }
          featuredImage {
              node {
              sourceUrl(size: MEDIUM_LARGE)
              mediaItemUrl
              altText
              }
          }
          tags {
            edges {
                node {
                    id
                    name
                    slug
                }
            }
          }
          
      }
      allSettings {
        generalSettingsUrl
      }
  }`,
    variables: { slug: blogId },
  });

  if (!apiResponse) {
    return null;
  }

  return transformDataToBlogPost(apiResponse, apiResponse.data.allSettings.generalSettingsUrl);
}

export async function getWordPressPage(params: SinglePageParams) {
  const { path, locale = 'en' } = params;

  const apiResponse = await fetchWordPressData({
    query: `query Page($path: ID!) {
      page(id: $path, idType: URI) {
        title
        content
        slug
        uri
        enqueuedStylesheets {
          nodes {
            src
            rel
            media
            path
            title
            handle
          }
        }
      }
    }`,
    variables: { path },
  });

  if (!apiResponse) {
    return null;
  }

  return apiResponse;
}

export async function fetchWordPressData({ query, variables }: fetchWordPressDataParams) {
  try {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    console.log('query', query);
    console.log('variables', variables);

    const graphql = JSON.stringify({
      query,
      variables,
    });

    const response = await fetch(process.env.WORDPRESS_GRAPHQL_ENDPOINT || '', {
      method: 'POST',
      headers: myHeaders,
      body: graphql,
      redirect: 'follow',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API fetch error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(error);
  }
}

// These functions are here primarily here to emulate the BigCommerce responses powering the BlogPost pages by default,
// so this can drop directly into an existing Catalyst page.
//
// e.g.  isVisibleInNavigation value is used in those pages and will render a 404 if it's set to false.
//
// That said, the functions do simplify the response used within the page and provide a central place to alter logic.

function transformDataToBlogPosts(apiResponse: any, tagId: string | undefined) {
  return {
    name: 'Blog' + (tagId ? `: ${tagId}` : ''),
    posts: {
      pageInfo: {
        hasNextPage: apiResponse.data.posts.pageInfo.hasNextPage,
        hasPreviousPage: apiResponse.data.posts.pageInfo.hasPreviousPage,
        startCursor: apiResponse.data.posts.pageInfo.startCursor,
        endCursor: apiResponse.data.posts.pageInfo.endCursor,
      },
      items: apiResponse.data.posts.edges.map((post: any) => {
        return {
          author: post.node.author.node.firstName
            ? `${post.node.author.node.firstName} ${post.node.author.node.lastName}`
            : '',
          entityId: post.node.slug,
          name: post.node.title,
          plainTextSummary: post.node.excerpt.replace(/(<([^>]+)>)/gi, ''),
          publishedDate: { utc: post.node.dateGmt },
          thumbnailImage: post.node.featuredImage
            ? {
                altText: post.node.featuredImage.node.altText || '',
                url: post.node.featuredImage.node.sourceUrl,
              }
            : null,
        };
      }),
    },
    isVisibleInNavigation: true,
  };
}

function transformDataToBlogPost(apiResponse: any, vanityUrl: string) {
  console.log('apiResponse.data.post', apiResponse.data.post, 'vanity', vanityUrl);
  return {
    author: apiResponse.data.post.author.node.firstName
      ? `${apiResponse.data.post.author.node.firstName} ${apiResponse.data.post.author.node.lastName}`
      : '',
    htmlBody: apiResponse.data.post.content,
    content: apiResponse.data.post.editorBlocks,
    id: apiResponse.data.post.slug,
    name: apiResponse.data.post.title,
    publishedDate: { utc: apiResponse.data.post.dateGmt },
    tags: apiResponse.data.post.tags.edges.map(
      (tag: {
        node: { id: string; name: string; slug: string };
      }): { name: string; href: string } => ({
        name: tag.node.name,
        href: `/blog/tag/${tag.node.slug}`,
      }),
    ),
    thumbnailImage: apiResponse.data.post.featuredImage
      ? {
          altText: apiResponse.data.post.featuredImage.node.altText || '',
          url: apiResponse.data.post.featuredImage.node.sourceUrl,
        }
      : null,
    seo: {
      metaKeywords: apiResponse.data.post.tags.edges
        .map((tag: { node: { name: string } }) => tag.node.name)
        .join(','),
      metaDescription: apiResponse.data.post.excerpt.replace(/(<([^>]+)>)/gi, ''),
      pageTitle: apiResponse.data.post.title,
    },
    isVisibleInNavigation: true,
    vanityUrl,
  };
}
