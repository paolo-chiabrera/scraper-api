'use strict';

const _ = require('lodash');
const async = require('async');

const Boom = require('boom');

const Xray = require('x-ray');

const concurrency = 4;

const expose = {};

// methods
expose.xray = Xray();

expose.mapLinks = function mapLinks(args, done) {
  if (!_.isFunction(done)) {
    throw new Error('done is not a Function');
  }

  const links = args.links;
  const selectors = args.selectors;

  if (!_.isArray(links) || _.isEmpty(links)) {
    done('links is not a valid Array');
    return;
  }

  if (!_.isObject(selectors) || _.isEmpty(selectors)) {
    done('selectors is not a valid Object');
    return;
  }

  if (!_.isString(selectors.imageSelector) || _.isEmpty(selectors.imageSelector)) {
    done('selectors.imageSelector is not a valid String');
    return;
  }

  async.mapLimit(links, concurrency, (link, next) => {
    expose.xray(link, 'body', selectors.imageSelector)(next);
  }, (err, results) => {
    if(err){
      done(err);
      return;
    }

    done(null, {
      results: results
    });
  });
}

expose.scrapeUrl = function scrapeUrl(args, done) {

  if (!_.isFunction(done)) {
    throw new Error('done is not a Function');
  }

  const url = args.url;
  const selectors = args.selectors;

  if (!_.isString(url) || _.isEmpty(url)) {
    done('url is not a valid String');
    return;
  }

  if (!_.isObject(selectors) || _.isEmpty(selectors)) {
    done('selectors is not a valid Object');
    return;
  }

  if (!_.isString(selectors.pageSelector) || _.isEmpty(selectors.pageSelector)) {
    done('selectors.pageSelector is not a valid String');
    return;
  }

  function handleResults(err, items){
    if (err) {
      done(err);
      return;
    }

    const links = _.chain(items).uniq().filter(_.isString).value();

    expose.mapLinks({
      links: links,
      selectors: selectors
    }, done);
  }

  expose.xray(url, 'body', [selectors.pageSelector])(handleResults);
}

expose.postScrapeUrl = function postScrapeUrl(request, reply) {
  expose.scrapeUrl({
    url: request.payload.url,
    selectors: {
      pageSelector: request.payload.pageSelector,
      imageSelector: request.payload.imageSelector
    }
  }, (err, results) => {
    if(err){
      reply(Boom.badImplementation(err));
      return;
    }

    reply(results);
  });
}

// exports
module.exports = expose;
