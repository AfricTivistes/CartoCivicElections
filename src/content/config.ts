// https://docs.astro.build/en/guides/content-collections/#defining-collections

import { z, defineCollection } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";
import { nocodbCollections } from "astro-nocodb/loaders";
import {
  initiativeSchema,
  initiativeMapper,
} from "../collections/initiatives/config";

// NocoDB configuration from environment variables
const API_URL = import.meta.env.API_URL || process.env.API_URL;
const API_TOKEN = import.meta.env.API_TOKEN || process.env.API_TOKEN;

const productsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      main: z.object({
        id: z.number(),
        content: z.string(),
        imgCard: image(),
        imgMain: image(),
        imgAlt: z.string(),
      }),
      tabs: z.array(
        z.object({
          id: z.string(),
          dataTab: z.string(),
          title: z.string(),
        }),
      ),
      longDescription: z.object({
        title: z.string(),
        subTitle: z.string(),
        btnTitle: z.string(),
        btnURL: z.string(),
      }),
      descriptionList: z.array(
        z.object({
          title: z.string(),
          subTitle: z.string(),
        }),
      ),
      specificationsLeft: z.array(
        z.object({
          title: z.string(),
          subTitle: z.string(),
        }),
      ),
      specificationsRight: z
        .array(
          z.object({
            title: z.string(),
            subTitle: z.string(),
          }),
        )
        .optional(),
      tableData: z
        .array(
          z.object({
            feature: z.array(z.string()),
            description: z.array(z.array(z.string())),
          }),
        )
        .optional(),
      blueprints: z.object({
        first: image().optional(),
        second: image().optional(),
      }),
    }),
});

const blogCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      contents: z.array(z.string()),
      author: z.string(),
      role: z.string().optional(),
      authorImage: image(),
      authorImageAlt: z.string(),
      pubDate: z.date(),
      cardImage: image(),
      cardImageAlt: z.string(),
      readTime: z.number(),
      tags: z.array(z.string()).optional(),
    }),
});

const insightsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // contents: z.array(z.string()),
      cardImage: image(),
      cardImageAlt: z.string(),
    }),
});

// NocoDB-powered initiatives collection
// Uses astro-nocodb loader with built-in rate limiting (exponential backoff on 429),
// automatic pagination, and Zod validation.
const nocodbData =
  API_URL && API_TOKEN
    ? nocodbCollections({
        baseUrl: API_URL,
        apiKey: API_TOKEN,
        tables: {
          initiatives: {
            tableId: "m9erh9bplb8jihp",
            schema: initiativeSchema,
            queryParams: {
              where: "(Status,eq,Traiter)",
              viewId: "vwdobxvm00ayso6s",
            },
            mapper: initiativeMapper,
            retries: 10, // Max retries on 429 rate limit errors
            delay: 2000, // Initial backoff delay (ms), doubles each retry
          },
        },
      })
    : {};

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  products: productsCollection,
  blog: blogCollection,
  insights: insightsCollection,
  ...nocodbData,
};
