/* eslint-disable class-methods-use-this */

/**
 * A Retryable Tester that validates exactly 10 tickers are in the database and that they all have a
 * chromosome
 */
export default class TickerDecorationTester {

  constructor(dataSource) {

    this.dataSource = dataSource;
  }

  checkResult() {

    return this.dataSource.findAllUpdatedTickers();
  }

  isPassingResult(tickers) {

    let hasTenTickersWithChromosomes = false;

    if (tickers && tickers.length === 10) {

      hasTenTickersWithChromosomes = TickerDecorationTester.checkAllTickersForChromosome(tickers);
    }
    return hasTenTickersWithChromosomes;
  }

  processPassingResult() {

    return {
      test: 'Ticker Decoration',
      success: true,
      msg: 'Test Passed, all tickers have a chromosome',
    };
  }

  processFailingResult() {

    return {
      test: 'Ticker Decoration',
      success: false,
      msg: 'Test Failed, tickers in database did not all have chromosomes',
    };
  }

  static checkAllTickersForChromosome(foundTickers) {

    let allTickersHaveChromosome = true;

    foundTickers.forEach((ticker) => {

      if (!ticker.chromosome || ticker.chromosome === '') {

        console.error(`Ticker ${JSON.stringify(ticker)} did not have an expected chromosome`);
        allTickersHaveChromosome = false;
      }
    });

    return allTickersHaveChromosome;
  }
}
