# 🚨 This Package is Deprecated 🚨
Now that Robinhood has a web application, its API has changed and this package no longer works. 

I hope you all found it as useful as I did. Thanks for the support!

# Robinhood to CSV

[![Coverage Status](https://coveralls.io/repos/github/markalfred/robinhood-to-csv/badge.svg?branch=master)](https://coveralls.io/github/markalfred/robinhood-to-csv?branch=master)
[![CircleCI](https://circleci.com/gh/markalfred/robinhood-to-csv.svg?style=svg)](https://circleci.com/gh/markalfred/robinhood-to-csv)

## Installation
```bash
$ npm install -g robinhood-to-csv
```

## Usage
```bash
$ robinhood-to-csv

symbol,shares,price,transaction_type,commission,date_executed
AAPL,100.00000,22.10,buy,0.00,2010-02-16T13:30:01.016000Z
GOOG,200.00000,49.75,buy,0.00,2010-08-27T14:20:24.420000Z
TSLA,99.00000,74.00,buy,0.00,2014-11-08T18:49:29.445000Z
GOOG,100.00000,743.50,sell,0.02,2016-02-16T14:20:24.420000Z
```

## Options
```bash
-h, --help                 output usage information
-V, --version              output the version number
-u, --username <username>  Robinhood login username
-p, --password <password>  Robinhood login password
-o, --output <file>        output filename (default: stdout)
```

## Notes
This CSV is formatted with importability into Google Finance in mind.
If you need some additional data in the output, please
[submit an issue](https://github.com/markalfred/robinhood-to-csv/issues/new?labels=add%20data%20to%20csv).
