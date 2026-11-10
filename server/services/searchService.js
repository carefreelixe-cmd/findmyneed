import {
  elasticsearch,
  elasticsearchEnabled,
} from "../config/elasticsearch.js";

const indexName =
  process.env.ELASTICSEARCH_SERVICES_INDEX || "marketplace-services";

export const searchServiceIds = async (text, limit = 100) => {
  if (!elasticsearchEnabled || !text) return null;

  try {
    const result = await elasticsearch.search({
      index: indexName,
      size: limit,
      query: {
        multi_match: {
          query: text,
          fields: [
            "serviceName^3",
            "businessName^2",
            "description",
            "categoryName",
          ],
          fuzziness: "AUTO",
        },
      },
    });
    return result.hits.hits.map((hit) => hit._id);
  } catch (error) {
    console.warn(
      "Elasticsearch unavailable; using PostgreSQL search:",
      error.message,
    );
    return null;
  }
};

export const indexService = async (service) => {
  if (!elasticsearchEnabled) return false;
  await elasticsearch.index({
    index: indexName,
    id: service.id,
    document: service,
    refresh: false,
  });
  return true;
};

export const removeIndexedService = async (serviceId) => {
  if (!elasticsearchEnabled) return false;
  await elasticsearch.delete({ index: indexName, id: serviceId });
  return true;
};
