
export default class HopperIntegration {

  constructor(request) {

    this.request = request;
    this.url = process.env.HOPPER_URL || 'http://localhost:8080';
  }

  async batchProcessTickers() {

    const batchId = await this.createBatch();
    return this.getResultOfBatch(batchId);
  }

  async createBatch() {

    const postOptions = {
      method: 'POST',
      uri: `${this.url}/chromosomes`,
    };

    const response = await this.request(postOptions);
    const batchId = JSON.parse(response);

    return batchId;
  }

  async getResultOfBatch(batchId) {

    const getOptions = {
      method: 'GET',
      uri: `${this.url}/chromosomes/${batchId}`,
    };

    const processedTickerIds = await this.request(getOptions);

    return JSON.parse(processedTickerIds);
  }
}
