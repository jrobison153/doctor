import { expect } from 'chai';
import HopperIntegration from '../../src/HopperIntegration';
import RequestSpy from '../spy/RequestSpy';

describe('HopperIntegration Test', () => {

  describe('when constructing', () => {

    it('defaults the hopper url if the env var is not set', () => {

      delete process.env.HOPPER_URL;

      const hopper = new HopperIntegration();

      expect(hopper.url).to.equal('http://localhost:8080');
    });

    it('sets the hopper url if the env var is set', () => {

      process.env.HOPPER_URL = 'http://somehost:9999';

      const hopper = new HopperIntegration();

      expect(hopper.url).to.equal(process.env.HOPPER_URL);
    });
  });

  describe('when batch processing tickers', () => {

    let requestSpy;
    let hopper;

    before(() => {

      delete process.env.HOPPER_URL;
      requestSpy = new RequestSpy();
      hopper = new HopperIntegration(requestSpy.request.bind(requestSpy));
    });

    it('issues a POST to the chromosome resource', async () => {

      await hopper.batchProcessTickers();

      expect(requestSpy.lastOperationOptions.POST.uri).to.match(/^http.*\/chromosomes$/);
    });

    it('issues a GET to the newly created chromosome resource', async () => {

      const resourceId = '123456';
      requestSpy.postToChromosomesReturns = resourceId;

      await hopper.batchProcessTickers();

      const regexStr = `^http.*/chromosomes/${resourceId}$`;
      const regex = new RegExp(regexStr);

      expect(requestSpy.lastOperationOptions.GET.uri).to.match(regex);
    });

    it('returns the array of processed ticker ids', async () => {

      const expectedProcessedTickerIds = ['abc', 'def', 'ghi'];
      requestSpy.getToChromosomesReturns = expectedProcessedTickerIds;

      const processedTickerIds = await hopper.batchProcessTickers();

      expect(processedTickerIds).to.deep.equal(expectedProcessedTickerIds);
    });
  });
});
