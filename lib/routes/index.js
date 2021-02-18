const express = require('express');
const endpoints = require('./endpoints');

const routes = express.Router();

routes.use('/', endpoints);

// health check
routes.get('/health', (req, res) => res.sendStatus(200));

module.exports = routes;
