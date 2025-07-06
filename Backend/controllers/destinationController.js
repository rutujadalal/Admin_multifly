const Destination = require("../models/destinationModel");

exports.getDestinations = async (req, res) => {
  try {
    const { category } = req.query; // e.g., ?category=Trending
    const result = await Destination.getAll(category);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.getById(id);
    if (!destination) return res.status(404).json({ error: "Destination not found" });
    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDestination = async (req, res) => {
  try {
    const { name, location, price, rating, review_count, category, image_url, admin_id } = req.body;
    const newDestination = await Destination.create(name, location, price, rating, review_count, category, image_url, admin_id);
    res.status(201).json(newDestination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, price, rating, review_count, category, image_url, admin_id } = req.body;
    const updatedDestination = await Destination.update(id, name, location, price, rating, review_count, category, image_url, admin_id);
    if (!updatedDestination) return res.status(404).json({ error: "Destination not found" });
    res.json(updatedDestination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDestination = await Destination.delete(id);
    if (!deletedDestination) return res.status(404).json({ error: "Destination not found" });
    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};