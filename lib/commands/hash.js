
/*!
 * Nedis - commands - hash
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils');

/**
 * HSET <key> <field> <val>
 */

(exports.hset = function(client, key, field, val){
  var key = utils.string(key)
    , field = utils.string(field)
    , hash = this.data[key];

  // New hash
  if (null == hash) {
    hash = {};
    hash.type = 'hash';
  } else if ('hash' != hash.type) {
    return client.typeError();
  }

  hash[field] = val;
  this.data[key] = hash;
  client.bool(true);
}).mutates = true;

/**
 * HMSET <key> (<field> <val>)+
 */

(exports.hmset = function(client, data){
  var len = data.length
    , key = utils.string(data[0])
    , hash = this.data[key]
    , field
    , val;

  // New hash
  if (null == hash) {
    hash = {};
    hash.type = 'hash';
  } else if ('hash' != hash.type) {
    return client.typeError();
  }

  if ('hash' != hash.type) return client.typeError();

  for (var i = 1; i < len; ++i) {
    field = utils.string(data[i++]);
    val = data[i];
    hash[field] = val;
  }

  this.data[key] = hash;
  client.ok();
}).mutates = true;

exports.hmset.multiple = 2;
exports.hmset.skip = 1;

/**
 * HGET <key> <field>
 */

exports.hget = function(client, key, field){
  var key = utils.string(key)
    , field = utils.string(field)
    , hash = this.data[key]
    , val;

  if (null == hash) return client.nil();
  if ('hash' != hash.type) return client.typeError();
  if (val = hash[field]) return client.send(val);

  client.nil();
};

/**
 * HGETALL <key>
 */

exports.hgetall = function(client, key){
  var key = utils.string(key)
    , hash = this.data[key]
    , list = [];

  if (null == hash) return client.emptyList();
  if ('hash' != hash.type) return client.typeError();

  for (var field in hash) {
    if ('type' == field) continue;
    list.push(field, hash[field]);
  }

  client.list(list);
};