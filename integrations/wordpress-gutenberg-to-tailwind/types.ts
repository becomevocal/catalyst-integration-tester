type PostsListParams = {
  tagId?: string;
  limit?: number;
  before?: number;
  after?: number;
  locale?: string;
};

type SinglePostParams = {
  blogId: string;
  locale?: string;
};

type SinglePageParams = {
  path: string;
  locale?: string;
};

type fetchWordPressDataParams = {
  query: string;
  variables: any;
};
