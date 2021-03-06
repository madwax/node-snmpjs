/*
 * Copyright (c) 2015 Jan Van Buggenhout.  All rights reserved.
 * Copyright (c) 2013 Joyent, Inc.  All rights reserved.
 */

var util = require('util');
var Receiver = require('./receiver');
var PDU = require('./protocol/pdu');

function
Listener(options)
{
	Receiver.call(this, options);
	this._connections = [];
}
util.inherits(Listener, Receiver);

Listener.prototype.bind = function bind(arg, cb) {
	var self = this;
	var conn;

	if (typeof (arg) !== 'object')
		throw new TypeError('arg (object) is required');
	if (typeof (arg.family) !== 'string')
		throw new TypeError('arg.family (string) is required');
	if (typeof (arg.port) !== 'number')
		throw new TypeError('arg.port (number) is required');
	if (typeof (arg.addr) !== 'undefined' &&
	    typeof (arg.addr) !== 'string')
		throw new TypeError('arg.addr must be a string');

	if (typeof (cb) !== 'undefined' && typeof (cb) !== 'function')
		throw new TypeError('cb must be a function');

	conn = this.createSocket(arg.family);
	this._connections.push(conn);

	conn.on('listening', function ()
	{
		if( self._log !== null )
		{
			self._log.info('Bound to ' + conn.address().address + ':' +   conn.address().port);
		}

		if (cb)
		{
			cb();
		}
	});

	conn.on('error', function (err) {
		if (cb)
			cb(err || new Error('Unknown binding error'));
		else
			throw err;
	});

	conn.bind(arg.port, arg.addr);
};

Listener.prototype.close = function close() {
	var self = this;

	this._connections.forEach(function (c)
	{
		if( self._log !== null )
		{
			self._log.info('Shutting down endpoint ' + c.address().address +  ':' + c.address().port);
		}
		c.close();
	});
};

// Used to send raw UDP packets over the sockets used
// TODO - RHC I know that I'm only ever binding to 1 udp4 address but???
Listener.prototype.transmit = function( bufferToSend, offset, length, port, ipAddress )
{
	var c = 0;

	this._connections.forEach( function( x ) {
		x.send( bufferToSend, offset, length, port, ipAddress );
		c++;
	});

	return c;
}

module.exports = Listener;
