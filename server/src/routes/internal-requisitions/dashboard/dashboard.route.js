const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('./dashboard.controller');

router.get('/metrics', getDashboardMetrics);

module.exports = router;