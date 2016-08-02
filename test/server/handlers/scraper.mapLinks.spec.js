'user strict';

const Lab = require('lab');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const lab = exports.lab = Lab.script();

const scraper = require('../../../server/handlers/scraper');

const async = require('async');

lab.experiment('scraper', () => {
  lab.test('it should be an obejct', (done) => {
    expect(scraper).to.be.an('object');
    done();
  });

  lab.experiment('mapLinks', () => {
    lab.test('it should be defined', (done) => {
      expect(scraper.mapLinks).to.be.a('function');
      done();
    });

    lab.test('it should throw an error if no callback is passed', (done) => {
      const err = new Error('done is not a Function');

      const mapLinks = sinon.spy(scraper, 'mapLinks');

      try {
        mapLinks({});
      } catch (e) {
        expect(e).to.eql(err);

        mapLinks.restore();
        done();
      }
    });

    lab.test('it should return an error: links is not a valid Array', (done) => {
      const mapLinks = sinon.spy(scraper, 'mapLinks');
      const cb = sinon.spy();

      mapLinks({}, cb);

      sinon.assert.calledWith(cb, 'links is not a valid Array');

      mapLinks.restore();
      done();
    });

    lab.test('it should return an error: selectors is not a valid Object', (done) => {
      const mapLinks = sinon.spy(scraper, 'mapLinks');
      const cb = sinon.spy();

      mapLinks({
        links: ['test']
      }, cb);

      sinon.assert.calledWith(cb, 'selectors is not a valid Object');

      mapLinks.restore();
      done();
    });

    lab.test('it should return an error: selectors.imageSelector is not a valid String', (done) => {
      const mapLinks = sinon.spy(scraper, 'mapLinks');
      const cb = sinon.spy();

      mapLinks({
        links: ['test'],
        selectors: {
          imageSelector: null
        }
      }, cb);

      sinon.assert.calledWith(cb, 'selectors.imageSelector is not a valid String');

      mapLinks.restore();
      done();
    });

    lab.test('it should return an error: asyc.mapLimit', (done) => {
      const mapLinks = sinon.spy(scraper, 'mapLinks');
      const cb = sinon.spy();

      const err = new Error('fake error');

      const mapLimit = sinon.stub(async, 'mapLimit', (links, concurrency, worker, cb) => {
        cb(err);
      });

      mapLinks({
        links: ['test'],
        selectors: {
          imageSelector: 'test'
        }
      }, cb);

      sinon.assert.calledWith(cb, err);

      mapLinks.restore();
      mapLimit.restore();
      done();
    });

    lab.test('it should return an array with an empty string', (done) => {
      const mapLinks = sinon.spy(scraper, 'mapLinks');
      const cb = sinon.spy();

      mapLinks({
        links: ['test'],
        selectors: {
          imageSelector: 'test'
        }
      }, cb);

      sinon.assert.calledWith(cb, null, {
        results: ['']
      });

      mapLinks.restore();
      done();
    });
  });
});
