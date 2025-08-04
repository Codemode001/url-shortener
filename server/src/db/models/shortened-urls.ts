import { db } from "../knex";

function generateSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export async function createShortenedUrl({
  original_url,
//   expires_at,
//   utm_params,
}: {
  original_url: string;
//   expires_at?: Date;
//   utm_params?: string;
}) {
  const slug = generateSlug();
  const [doc] = await db("shortened_urls")
    .insert({
      original_url,
      slug,
    //   expires_at,
    //   utm_params,
    })
    .returning("*");
  return doc;
}

export async function getBySlug(slug: string) {
  return db("shortened_urls").where({ slug }).first();
}