/*
 * Copyright (c) 2013 Joyent, Inc.  All rights reserved.
 */

/*
 * SNMP is defined by a large set of specifications.  See
 * http://www.snmp.com/protocol/snmp_rfcs.shtml as a starting point.
 */

var Agent = require('./agent');
var Client = require('./client');
var TrapListener = require('./trap_listener');
var MIB = require('./mib');
var provider = require('./provider');
var message = require('./protocol/message');
var PDU = require('./protocol/pdu');
var varbind = require('./protocol/varbind');
var data = require('./protocol/data');
var uint64_t = require('./protocol/uint64_t');

var agent_provider;

module.exports = {
	createAgent: function createAgent(options) {
		if (!options)
			options = {};
		if (!options.name)
			options.name = 'snmpjs';

		if( !options.hasOwnProperty( "log" ) )
		{
			options.log = null;
		}

		return (new Agent(options));
	},

	createMIB: function createMIB(def) {
		var mib = new MIB();
		if (def)
			mib.add(def);

		return (mib);
	},

	createClient: function createClient(options) {
		if (!options)
			options = {};
		if (!options.name)
			options.name = 'snmpjs';

		if( !options.hasOwnProperty( "log" ) )
		{
			options.log = null;
		}

		return (new Client(options));
	},

	createTrapListener: function createTrapListener(options) {
		if (!options)
			options = {};
		if (!options.name)
			options.name = 'snmpjs';

		if( !options.hasOwnProperty( "log" ) )
		{
			options.log = null;
		}

		return (new TrapListener(options));
	},

	message: message,
	pdu: PDU,
	varbind: varbind,
	data: data,
	provider: provider,
	uint64_t: uint64_t
};
