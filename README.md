snmpjs provides a toolkit for SNMP agents and management applications in
Node.js.

## Whats been changed!!!
1) Lots of patches that are floating around.
2) Real example of how to send v2 Trap.  The agent object how has a transmit() which calls the sends of all the underlaying socket objects.  Means you don't have to create a new socket object.
3) The community string is passed to handers so they can do what's needed. Other have put it in the API but I want access to it.
4) DTrace has gone!!! So Windows here we come :)
5) Ditched bunyran for logging (as I don't use it + it pulls in DTrace) so started to put in a generic logging interface.   

## Usage

For full docs, see <http://joyent.github.com/node-snmpjs/>.

	var os = require('os');
	var snmp = require('snmpjs');

	var agent = snmp.createAgent();

	agent.request({ oid: '.1.3.6.1.2.1.1.5', handler: function (prq) {
		var nodename = os.hostname();
		var val = snmp.data.createData({ type: 'OctetString',
		    value: nodename });

		snmp.provider.readOnlyScalar(prq, val);
	} });

	agent.bind({ family: 'udp4', port: 161 });

Try hitting that with your favourite SNMP get utility, such as:

	$ snmpget -v 2c -c any localhost .1.3.6.1.2.1.1.5.0

## Installation

	$ npm install snmpjs

## License

MIT.

## Bugs

See <https://github.com/joyent/node-snmpjs/issues>.
