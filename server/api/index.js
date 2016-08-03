'use strict';

const Joi = require('joi');

const scraper = require('../handlers/scraper');

exports.register = function (server, options, next) {

  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {
        reply({ message: 'Welcome to the Scraper API.' });
      },
      cache: {
        expiresIn: 3600 * 1000,
        privacy: 'public'
      }
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
        .required()
        .keys({
          url: Joi.string().required().description('url to scrape'),
          selectors: Joi.object().required().keys({
            page: Joi.string().required().description('CSS selector for the page - .page a@href'),
            image: Joi.string().required().description('CSS selector for the image - .image img@src')
          })
        })
      },
      cache: {
        expiresIn: 30 * 1000,
        privacy: 'public'
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'api'
};
