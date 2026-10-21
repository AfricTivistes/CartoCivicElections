// https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from "astro:content";
import type { Loader } from "astro/loaders";
import {
  initiativeSchema,
  initiativeMapper,
} from "./collections/initiatives/config";

// NocoDB configuration from environment variables
const API_URL = import.meta.env.API_URL || process.env.API_URL;
const API_TOKEN = import.meta.env.API_TOKEN || process.env.API_TOKEN;

const TABLE_ID = "m9erh9bplb8jihp";
const PAGE_SIZE = 100;
const MAX_RETRIES = 10;
const INITIAL_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetches one page of NocoDB records, retrying with exponential backoff on
 * 429 (rate limit) and transient 5xx errors.
 */
async function fetchPage(offset: number) {
  const url = new URL(`/api/v2/tables/${TABLE_ID}/records`, API_URL);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("where", "(Status,eq,Traiter)");

  let delay = INITIAL_DELAY_MS;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "xc-token": API_TOKEN! } });
    if (res.ok) return res.json();
    const retriable = res.status === 429 || res.status >= 500;
    if (!retriable || attempt >= MAX_RETRIES) {
      throw new Error(`NocoDB ${res.status} ${res.statusText} (offset ${offset})`);
    }
    await sleep(delay);
    delay *= 2;
  }
}

/**
 * Minimal NocoDB loader (replaces astro-nocodb, which is pinned to Astro 5).
 * Paginates through the table, maps raw records with initiativeMapper and
 * validates them against initiativeSchema.
 */
function nocodbLoader(): Loader {
  return {
    name: "nocodb-initiatives",
    load: async ({ store, parseData, logger }) => {
      store.clear();
      let offset = 0;
      let total = 0;
      while (true) {
        const page = await fetchPage(offset);
        const list: any[] = page.list ?? [];
        for (const raw of list) {
          const mapped = initiativeMapper(raw);
          const id = String(mapped.Id);
          const data = await parseData({ id, data: mapped });
          store.set({ id, data });
          total++;
        }
        if (page.pageInfo?.isLastPage || list.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }
      logger.info(`${total} initiatives chargées depuis NocoDB`);
    },
  };
}

/**
 * Prévisualisation locale sans accès NocoDB : SOOBU_FIXTURE pointe vers un
 * tableau JSON d'initiatives déjà au format du schéma.
 */
function fixtureLoader(file: string): Loader {
  return {
    name: "initiatives-fixture",
    load: async ({ store, parseData, logger }) => {
      const { readFile } = await import("node:fs/promises");
      const items: any[] = JSON.parse(await readFile(file, "utf-8"));
      store.clear();
      for (const item of items) {
        const id = `${item.langue}-${item.slug}`;
        // JSON sérialise undefined en null : on retire ces clés pour les défauts du schéma
        for (const k of Object.keys(item)) if (item[k] === null) delete item[k];
        store.set({ id, data: await parseData({ id, data: item }) });
      }
      logger.warn(`Fixture ${file} : ${items.length} initiatives (pas de NocoDB)`);
    },
  };
}

const FIXTURE = process.env.SOOBU_FIXTURE;

const loader =
  API_URL && API_TOKEN ? nocodbLoader() : FIXTURE ? fixtureLoader(FIXTURE) : null;

export const collections = loader
  ? { initiatives: defineCollection({ loader, schema: initiativeSchema }) }
  : {};
