# dblstatistics.js

An official module for interacting with dblstatistics.com API

## Installation

`npm i dblstatistics.js`

## Usage

```js
const DBLStats = require('dblstatistics.js')

const dbl = new DBLStats('Your token')

// e.g
await dbl.getBot('id') // bot info
```

## Methods

**Returns information on a given bot**

`dbl.getBot(id)`

id = ID of the bot

`dbl.getBotHistory(id, limit)`

**Returns the historical data separated by hour**

id = ID of the bot

limit = Amount of data to fetch

`dbl.getTop(by, limit)`

**Fetches leaderboard for given list**

by = Which list to fetch, options = `servers`, `votes`, `monthly votes`, `shards`

limit = Amount of data to fetch

`dbl.getUsersBots(id)`

**Gives .user as user object and .bots is a list of bots the user owns**

id = ID of the user

`dbl.getTags()`

**Returns a list of tags .server is those for servers, and .bot is those for bots**