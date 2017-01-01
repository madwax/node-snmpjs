var os = require('os');
var snmp = require('./lib/index.js');

var agent = snmp.createAgent({});

agent.request({ oid: '.1.3.6.1.2.1.1.4', handler: function (prq) {
    var val = snmp.data.createData({
      type: 'OctetString',
      value: ""
    });
    snmp.provider.readOnlyScalar(prq, val);

} });

agent.request({ oid: '.1.3.6.1.2.1.1.5', handler: function (prq) {
    var nodename = os.hostname();
    var val = snmp.data.createData({ type: 'OctetString', value: nodename });
    snmp.provider.readOnlyScalar(prq, val);

} });

agent.request( { oid: '.1.3.6.1.2.1.1.6', handler: function (prq) {
      var val = snmp.data.createData({ type: 'OctetString',  value: "On Chapmans desk" });
      snmp.provider.readOnlyScalar(prq, val);
  } }
);

var _theCounter = 55;

agent.request( { oid: '.1.3.6.1.2.1.1.9', handler: function (prq) {

      if( typeof( prq.value ) !== "undefined" )
      {
        console.log( "We have a value to play with:" + prq.value );
        for( var n in prq.value )
        {
console.log( "  Name:" + n + " Value:" + prq.value[ n ] );
        }
      }

      var val = snmp.data.createData({ type: 'Integer',  value:_theCounter });
      snmp.provider.writableScalar(prq, val);
  } }
);

agent.bind({ family: 'udp4', port: 5162 });

var _trapSendCounter = 0;

function sendTrap()
{
  console.log( "Setting trap...." );
  try
  {
    var binds = [];

    var trapOid = ".1.3.6.1.2.1.1";

    /// YOU NEED THESE!
    binds.push( snmp.varbind.createVarbind( { oid: ".1.3.6.1.2.1.1.3.0", data: snmp.data.createData( { type: 'TimeTicks', value: 0 } ) } ) );
    binds.push( snmp.varbind.createVarbind( { oid: ".1.3.6.1.6.3.1.1.4.1.0", data: snmp.data.createData( { type: 'ObjectIdentifier', value: "" + trapOid } ) } ) );

    /// Your optional payload
    binds.push( snmp.varbind.createVarbind( { oid: ".1.3.6.1.2.1.1.4", data: snmp.data.createData( { type:"OctetString", value:"Hi there " + _trapSendCounter } ) } ) );

    if( _trapSendCounter % 2 )
    {
      binds.push( snmp.varbind.createVarbind( { oid: ".1.3.6.1.2.1.1.5", data: snmp.data.createData( { type:"OctetString", value:"" } ) } ) );
    }

    var trap = snmp.message.createMessage({
      version: 1, // For SNMP2 traps
      community: "public",
      pdu: snmp.pdu.createPDU({
        op: 7,//SNMP v2 trap
        request_id: _trapSendCounter++,
  			varbinds:binds
      }),
    });

  trap.encode();

  var ipAddress = "localhost";
  var sentOver = agent.transmit( trap._raw.buf, 0, trap._raw.len, 5163, ipAddress );

  console.log( " % Send data to:" + ipAddress + " over " + sentOver + " connections" );

  }
  catch( e )
  {
    console.error( "There was a problem with sending the trap" );
    console.error( e );
    console.error( e.stack.split( "\n" ) );
  }
}

// setInterval( sendTrap, 1000 );
