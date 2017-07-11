# Introduction
An a series of System End To End tests that validates the integration of the components involved in the 'decoration' phase of the kaching project.

# Test Goals

## Batch Processing
Performs the following steps to verify that tickers can be read bulk read from the data source and sent to the decoration service.

### Steps

1. write some tickers to the database
2. make a batch request to the ticker-processor service
3. verify that all batch processed tickers have been written back to the database by ticker-decorator