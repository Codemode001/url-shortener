/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("shortened_urls", function(table) {
    table.increments("id").primary();
    table.string("original_url").notNullable();
    table.string("slug", 8).notNullable().unique();
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("shortened_urls");
};
