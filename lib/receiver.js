/*
 * Copyright (c) 2015 Jan Van Buggenhout.  All rights reserved.
 * Copyright (c) 2013 Joyent, Inc.  All rights reserved.
 */

var dgram = require('dgram');
var util = require('util');
var events = require('events');
var PDU = require('./protocol/pdu');
var message = require('./protocol/message');

function
Receiver(options)
{
	this._log = null;

	if (typeof (options) !== 'object')
		throw new TypeError('options (object) is required');

	if (typeof (options.log) === 'object')
	{
		this._log = options.log;
	}

	this._name = options.name || 'snmpjs';

	this._malformed_messages = 0;
}
util.inherits(Receiver, events.EventEmitter);

Receiver.prototype._process_msg = function _process_msg(msg)
{
	if( this._log !== null )
	{
		this._log.debug({
			raw: msg.raw,
			origin: msg.src,
			snmpmsg: msg
		    }, 'Ignoring PDU of inappropriate type ' +
			PDU.strop(msg.pdu.op) );
	}
};

Receiver.prototype._augment_msg = function _augment_msg(msg, conn) {
};

Receiver.prototype._recv = function _recv(raw, src, conn) {
	var msg;

	try {
		msg = message.parseMessage({ raw: raw, src: src });
	} catch (err) {
		this._malformed_messages++;
		var errData = {
			err: err,
			raw: raw,
			origin: src
		};

		if( this._log !== null )
		{
			this._log.warn(errData, 'Invalid SNMP message');
		}
		this.emit('invalidMessage', errData);
		return;
	}

	this._augment_msg(msg, conn);

	if( this._log !== null )
	{
		this._log.trace({ raw: raw, origin: src, snmpmsg: msg }, 'Received SNMP message');
	}

	this.emit('message', msg);
	this._process_msg(msg);
};

Receiver.prototype.createSocket = function createSocket(family) {
	var self = this;
	var conn;

	if (typeof (family) !== 'string')
		throw new TypeError('family (string) is required');

	conn = dgram.createSocket( {
		type:family,
		reuseAddr:true
	} );
	conn.on('message', function _recv_binder(msg, rinfo) {
		var raw = {
			buf: msg,
			len: rinfo.size
		};
		var src = {
			family: family,
			address: rinfo.address,
			port: rinfo.port
		};
		self._recv(raw, src, conn);
	});

	return (conn);
};

module.exports = Receiver;
