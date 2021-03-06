# bpanel utils

Simple helper utilities for use in bpanel plugins

## Usage

``` js
const utils = require('@bpanel/bpanel-utils');
```

## Utilities

#### User Experience Transaction

```js
import { UXTX } from '@bpanel/bpanel-utils';
import { WalletClient } from 'bclient';

const walletClient = new WalletClient({
  network: 'main',
  port: 8334,
  apiKey: SECRETS.API_KEY,
});

const id = 'primary';
const wallet = walletClient.wallet(id);

/*
 * try fetching the hash yourself
   curl -s https://blockchain.info/rawblock/0000000000000000000c76fd257881891a21a018c4abd13c33c9f06a822914c9 \
     | jq -r .tx[0].hash
 */

const hash = '6b3aafbed09f215d1f95fb06b7c204d12f7657e1bc1ff3dfa37d3248e05a430c';

const tx = await wallet.getTX(hash)

const options = {
  constants: { DATE_FORMAT: 'moment js date format string' },
  labels: {}, // see labels object for usable labels
  json: tx,
  wallet: id, // wallet name
};

const uxtx = UXTX.fromRaw(tx.tx, 'hex', options);

const json = uxtx.toJSON();

```

`uxtx.toJSON` will use the labels and transaction information to
return human readable information about the transaction.
It is particularly useful for calculating tabular data, for example,
displaying if a specific transaction was incoming or outgoing.
There are more ways that this class can be extended, for example detecting
coinjoin transactions or sweep transactions.

#### Tx Manager

A wrapper around `UXTX` to manage many transactions.

```js

import { TxManager, TxManagerOptions, UXTXOptions } from '@bpanel/bpanel-utils';

// set bitcoin as the current chain
UXTXOptions.chain = 'bitcoin';

// use default labels and constants in TxManagerOptions
(async () => {
  const txManager = TxManager.fromOptions(TxManagerOptions);

  const account = 'default';
  const txs = await wallet.getHistory(account);

  // generate list of UXTX.toJSON with default labels and constants
  const parsed = txManager.parse(txs, UXTXOptions);
})();
```

#### Chain

This package includes helpers around the chain

```js

import { chain } from '@bpanel/bpanel-utils';

console.log(chain.isChainSupported('bitcoin'));
// true

console.log(chain.isChainSupported('monero'));
// false

console.log(chain.isChainSupported('bitcoincash'));
// true

console.log(chain.isChainSupported('handshake'));
// true
```

`chain.isChainSupported` is a helper function that
returns a boolean based on whether or not the input
string is a supported chain. The supported chains
can be inspected in `chain.CHAINS`


#### HD

This package includes helpers around HD tree derivation

```js

import { COIN_TYPES, PURPOSE } from '@bpanel/bpanel-utils';
import assert from 'bsert';

const bitcoin = COIN_TYPES['bitcoin']['main'];

assert(bitcoin === 0);

const bitcoincash = COIN_TYPES['bitcoincash']['main'];

assert(bitcoincash === 145);

assert(PURPOSE === 44);
```

#### BPClient

A utility client to manage connections to a node within your app.
It is configured to make connections via the proxy server where your bPanel app
is served from, but should support custom connections either directly to a remote
node or even one running on the client. It will support connecting to a bcoin, bcash,
or handshake node.

Example:

```js
import { BPClient } from '@bpanel/bpanel-utils';

(async function() {
  const client = new BPClient({ id: 'test', chain: 'bcoin' });

  // get all available clients from your server
  const clients = await client.getClients();

  // get default client of server if one is set
  const defaultClient = await client.getDefault();

  // get info for a specific client. Defaults to
  // the id of your client
  const getClientInfo = await client.getClientInfo();

  // get a node client to query your node with
  const nodeClient = client.getNodeClient();

  // use node client to run normal node api operations
  const nodeInfo = await nodeClient.getInfo();
})();
```

##### getClient

Using `getClient` you can retrieve a global instance of BPClient within your app.
This ensures that you are querying the same node as other plugins. The client returned
will have all clients and methods available to the parent BPClient class.


```js
import { getClient } from '@bpanel/bpanel-utils';

const client = getClient();

(async function() {
  if (!client.id)
    client.setClientInfo('test', 'handshake');

  // now you can start using your clients
  // anywhere else in the app that uses the client from `getClient`
  // will also be using the `test` clients until the info is changed again

  const info = await client.node.getInfo();

  console.log('info: ', info);
})();
```

#### Primitives

A high level goal of bPanel is to allow for many different blockchain
backends. To allow for dynamic switching of chains when implementing
logic with primitives, it is possible to use objects that are keyed
by the blockchain name to the primitive. These objects are wrapped
with some helper functions that work via the primitive `from` methods.
Each of the exposed functions are named `toPrimitive` where primitive
is a bcoin primitive.

```js
// create a bitcoin mtx
const hex = Buffer.from('...', 'hex');
// first argument shares properties of objects returned
// by bcoin backend. second argument is the options
const mtx = toMTX({ hex }, { type: 'raw', chain: 'bitcoin' });

// create a bitcoin cash mtx
const bchmtx = toMTX({ hex }, { type: 'raw', chain: 'bitcoincash' });

const hns = Buffer.from('...', 'hex');
const hnsmtx = toMTX({ hex: hns }, { type: 'raw', chain: 'handshake' });
```

#### Bytes

```js

import { helpers } from '@bpanel/bpanel-utils';
import assert from 'bsert';

const twelve = 12;

assert(helpers.isU8(twelve));

const sixhundredtwelve = 612;

assert(helpers.isU16(sixhundredtwelve));
```

#### ProxySocket
A utility that can be passed to a bcoin or bcash node that you would like to run in
the browser.

```js
import { ProxySocket } from '@bpanel/bpanel-utils';

const node = new FullNode({
      prune: true,
      network: 'main',
      memory: false,
      coinCache: 30,
      createSocket: (port, host) => {
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const hostname = window.location.hostname;
        return ProxySocket.connect(
          `${proto}://${hostname}`,
          port,
          host
        );
      }
    });
```

Take a look at the bcoin guide to learn more about
[running a node in the browser](https://bcoin.io/guides/browser.html)

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`

## License

- Copyright (c) 2018, Bcoin Devs (MIT License).

See LICENSE for more info.
