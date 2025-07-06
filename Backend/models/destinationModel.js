const pool = require("../config/db");

const Destination = {
  // Get all destinations with filtering by category
  getAll: async (category) => {
    let query = "SELECT * FROM destinations";
    const params = [];
    if (category) {
      query += " WHERE category = $1";
      params.push(category);
    }
    query += " ORDER BY created_at DESC";
    return pool.query(query, params);
  },

  // Get a single destination by ID
  getById: async (id) => {
    const query = "SELECT * FROM destinations WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Create a new destination
  create: async (name, location, price, rating, review_count, category, image_url, admin_id) => {
    const query = `
      INSERT INTO destinations (name, location, price, rating, review_count, category, image_url, admin_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [name, location, price, rating, review_count, category, image_url, admin_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update a destination
  update: async (id, name, location, price, rating, review_count, category, image_url, admin_id) => {
    const query = `
      UPDATE destinations 
      SET name = $2, location = $3, price = $4, rating = $5, review_count = $6, category = $7, image_url = $8, admin_id = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, name, location, price, rating, review_count, category, image_url, admin_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete a destination
  delete: async (id) => {
    const query = "DELETE FROM destinations WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = Destination;