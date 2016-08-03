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

  if (!_.isString(selectors.image) || _.isEmpty(selectors.image)) {
    done('selectors.image is not a valid String');
    return;
  }

  async.mapLimit(links, concurrency, (link, next) => {
    expose.xray(link, 'body', selectors.image)(next);
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

  if (!_.isString(selectors.page) || _.isEmpty(selectors.page)) {
    done('selectors.page is not a valid String');
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

  expose.xray(url, 'body', [selectors.page])(handleResults);
}

expose.postScrapeUrl = function postScrapeUrl(request, reply) {
  expose.scrapeUrl(request.payload, (err, results) => {
    if(err){
      reply(Boom.badImplementation(err));
      return;
    }

    reply(results);
  });
}

// exports
module.exports = expose;
