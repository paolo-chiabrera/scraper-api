'use strict';

const Joi = require('joi');

const scraper = require('../handlers/scraper');

exports.register = function (server, options, next) {

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply({ message: 'Welcome to the Scraper API.' });
    }
  });

  server.route({
    method: 'POST',
    path: '/scrape',
    config: {
      handler: scraper.postScrapeUrl,
      tags: ['api'],
      description: 'Scrape an url',
      notes: 'Returns an Array of links',
      validate: {
        payload: Joi
        .object()
        .description('scraping configuration')
        .required()
        .keys({
          url: Joi.string().required().description('url to scrape'),
          pageSelector: Joi.string().required().description('CSS selector for the page - .page a@href'),
          imageSelector: Joi.string().required().description('CSS selector for the image - .image img@src')
        })
      },
      cache: {
        expiresIn: 30 * 1000,
        privacy: 'private'
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'api'
};
