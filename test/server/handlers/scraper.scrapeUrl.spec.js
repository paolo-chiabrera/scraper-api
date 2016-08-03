'user strict';

const Lab = require('lab');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const lab = exports.lab = Lab.script();

const scraper = require('../../../server/handlers/scraper');

lab.experiment('scraper', () => {
  lab.test('it should be an obejct', (done) => {
    expect(scraper).to.be.an('object');
    done();
  });

  lab.experiment('xray', () => {
    lab.test('it should be defined', (done) => {
      expect(scraper.xray).to.be.a('function');
      done();
    });
  });

  lab.experiment('scrapeUrl', () => {
    lab.test('it should be defined', (done) => {
      expect(scraper.scrapeUrl).to.be.a('function');
      done();
    });

    lab.test('it should throw an error if no callback is passed', (done) => {
      const err = new Error('done is not a Function');

      const scrapeUrl = sinon.spy(scraper, 'scrapeUrl');

      try {
        scrapeUrl({});
      } catch (e) {
        expect(e).to.eql(err);

        scrapeUrl.restore();
        done();
      }
    });

    lab.test('it should return an error: url is not a valid String', (done) => {
      const scrapeUrl = sinon.spy(scraper, 'scrapeUrl');
      const cb = sinon.spy();

      scrapeUrl({}, cb);

      sinon.assert.calledWith(cb, 'url is not a valid String');

      scrapeUrl.restore();
      done();
    });

    lab.test('it should return an error: selectors is not a valid Object', (done) => {
      const scrapeUrl = sinon.spy(scraper, 'scrapeUrl');
      const cb = sinon.spy();

      scrapeUrl({
        url: 'test'
      }, cb);

      sinon.assert.calledWith(cb, 'selectors is not a valid Object');

      scrapeUrl.restore();
      done();
    });

    lab.test('it should return an error: selectors.page is not a valid String', (done) => {
      const scrapeUrl = sinon.spy(scraper, 'scrapeUrl');
      const cb = sinon.spy();

      scrapeUrl({
        url: 'test',
        selectors: {
          page: null
        }
      }, cb);

      sinon.assert.calledWith(cb, 'selectors.page is not a valid String');

      scrapeUrl.restore();
      done();
    });

    lab.test('it should return an error raised by x-ray', (done) => {
      const scrapeUrl = sinon.spy(scraper, 'scrapeUrl');
      const cb = sinon.spy();

      const err = new Error('fake error');

      const xray = sinon.stub(scraper, 'xray', () => {
        const fn = function(cb) {
          cb(err);
        }
        return fn;
      });

      scrapeUrl({
        url: 'test',
        selectors: {
          page: 'test'
        }
      }, cb);

      sinon.assert.calledWith(cb, err);

      scrapeUrl.restore();
      xray.restore();
      done();
    });

    lab.test('it should return an empty Array', (done) => {
      const scrapeUrl = sinon.spy(scraper, 'scrapeUrl');
      const cb = sinon.spy();

      const expected = ['a', 'b'];

      const mapLinks = sinon.stub(scraper, 'mapLinks', (args, done) => {
        done(null, expected);
      });

      scrapeUrl({
        url: 'test',
        selectors: {
          page: 'test'
        }
      }, cb);

      sinon.assert.calledWith(cb, null, expected);

      scrapeUrl.restore();
      mapLinks.restore();
      done();
    });
  });
});
