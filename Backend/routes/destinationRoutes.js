const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");

// Admin-protected routes (assume auth middleware is applied)
router.get("/destinations", destinationController.getDestinations);
router.get("/destinations/:id", destinationController.getDestinationById);
router.post("/destinations", destinationController.createDestination);
router.put("/destinations/:id", destinationController.updateDestination);
router.delete("/destinations/:id", destinationController.deleteDestination);

module.exports = router;