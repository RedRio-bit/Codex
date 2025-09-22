import * as prismic from "@prismicio/client";

export const repositoryName =
  process.env.PRISMIC_REPOSITORY_NAME ?? "your-repository-name";

export const routes: prismic.ClientConfig["routes"] = [];

export function createClient(config: prismic.ClientConfig = {}): prismic.Client {
  const client = prismic.createClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    routes,
    ...config,
  });

  return client;
}
