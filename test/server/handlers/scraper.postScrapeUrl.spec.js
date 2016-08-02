'user strict';

const Lab = require('lab');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const lab = exports.lab = Lab.script();

const scraper = require('../../../server/handlers/scraper');

const Boom = require('boom');

lab.experiment('scraper', () => {
  lab.test('it should be an obejct', (done) => {
    expect(scraper).to.be.an('object');
    done();
  });

  lab.experiment('postScrapeUrl', () => {
    lab.test('it should be defined', (done) => {
      expect(scraper.postScrapeUrl).to.be.a('function');
      done();
    });

    lab.test('it should return an error from: scrapeUrl', (done) => {
      const fakeError = 'fake error';
      const cb = sinon.spy();

      const scrapeUrl = sinon.stub(scraper, 'scrapeUrl', (args, done) => {
        done(fakeError);
      });

      const request = {
        payload: {
          url: 'test',
          pageSelector: 'test',
          imageSelector: 'test'
        }
      };

      scraper.postScrapeUrl(request, cb);

      sinon.assert.calledWith(cb, Boom.badImplementation(fakeError));

      scrapeUrl.restore();
      done();
    });

    lab.test('it should return a result Object', (done) => {
      const cb = sinon.spy();

      const expected = {
        results: ['a', 'b']
      };

      const scrapeUrl = sinon.stub(scraper, 'scrapeUrl', (args, done) => {
        done(null, expected);
      });

      const request = {
        payload: {
          url: 'test',
          pageSelector: 'test',
          imageSelector: 'test'
        }
      };

      scraper.postScrapeUrl(request, cb);

      sinon.assert.calledWith(cb, expected);

      scrapeUrl.restore();
      done();
    });
  });
});
