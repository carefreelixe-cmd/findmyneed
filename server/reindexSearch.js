import "dotenv/config";
import pool from "./config/database.js";
import { elasticsearch, elasticsearchEnabled } from "./config/elasticsearch.js";

const indexName =
  process.env.ELASTICSEARCH_SERVICES_INDEX || "marketplace-services";

if (!elasticsearchEnabled) {
  console.error("ELASTICSEARCH_URL is required to rebuild the search index");
  process.exit(1);
}

try {
  const exists = await elasticsearch.indices.exists({ index: indexName });
  if (!exists) {
    await elasticsearch.indices.create({
      index: indexName,
      mappings: {
        properties: {
          serviceName: { type: "text" },
          businessName: { type: "text" },
          description: { type: "text" },
          categoryName: { type: "text" },
          city: { type: "keyword" },
          suburb: { type: "keyword" },
          price: { type: "double" },
          rating: { type: "double" },
        },
      },
    });
  }

  const result = await pool.query(`
    SELECT s.id, s.name AS "serviceName", s.description, s.price,
           p.business_name AS "businessName", p.city, p.suburb, p.rating,
           sc.name AS "categoryName"
    FROM services s
    JOIN providers p ON p.id = s.provider_id
    JOIN users u ON u.id = p.user_id
    LEFT JOIN service_categories sc ON sc.id = s.category_id
    WHERE s.is_active = true AND s.deleted_at IS NULL
      AND p.deleted_at IS NULL AND u.is_active = true
  `);

  if (result.rowCount > 0) {
    const operations = result.rows.flatMap((service) => [
      { index: { _index: indexName, _id: service.id } },
      service,
    ]);
    const response = await elasticsearch.bulk({ operations, refresh: true });
    if (response.errors) throw new Error("One or more search documents failed");
  }

  console.log(`Indexed ${result.rowCount} services into ${indexName}.`);
} catch (error) {
  console.error("Search reindex failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
  await elasticsearch.close();
}
