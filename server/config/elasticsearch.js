import { Client } from "@elastic/elasticsearch";
import "dotenv/config";

const elasticsearchUrl = process.env.ELASTICSEARCH_URL;

export const elasticsearchEnabled = Boolean(elasticsearchUrl);

export const elasticsearch = elasticsearchEnabled
  ? new Client({
      node: elasticsearchUrl,
      auth: process.env.ELASTICSEARCH_API_KEY
        ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
        : undefined,
      requestTimeout: 2000,
      maxRetries: 1,
    })
  : null;
