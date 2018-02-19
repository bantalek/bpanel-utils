/*!
 * chain.js - basic utilities for bpanel chain operations
 * Copyright (c) 2018, Bcoin Devs (MIT License).
 * https://github.com/bcoin-org/bpanel-utils
 */

'use strict';

const assert = require('assert');
const api = require('./api');
const helpers = require('./helpers');

// Simple API call to retrieve a block at specified height or hash
// returns a promise
function getBlock(hashOrHeight) {
  const endpoint = api.get.block(hashOrHeight);
  return fetch(endpoint)
    .then(response => response.json())
    .catch(
      err => console.error('Error retrieving block: ', err) // eslint-disable-line no-console
    );
}

function calcProgress(start, tip) {
  const current = tip - start;
  const end = helpers.now() - start - 40 * 60;
  return Math.min(1, current / end);
}

// utility to get a range of blocks
async function getBlocksInRange(start, end, step = 1) {
  // get all blocks from blockHeight `start` up to `start`+ n
  // create an array of the blocks
  const blocks = [];

  let height = start;
  if (start < end) {
    // counting up
    assert(step > 0, 'Step needs to be greater than zero to count up');
    while (height < end) {
      try {
        const block = await getBlock(height);
        blocks.push(block);
        height += step;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error retrieving block: ', e);
        return blocks;
      }
    }
  } else if (start > end) {
    // counting down
    let _step = step;
    if (step >= 1) {
      _step = -1;
    } else {
      assert(step < 1, 'Step must be negative to countdown');
    }
    while (height > end) {
      try {
        const block = await getBlock(height);
        blocks.push(block);
        height += _step;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error retrieving block: ', e);
        return blocks;
      }
    }
  }

  return blocks;
}

module.exports = {
  calcProgress,
  getBlock,
  getBlocksInRange
};