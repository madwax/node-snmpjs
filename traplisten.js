var os = require('os');
var snmp = require('./lib/index.js');
var  util = require( "util" );
try
{
var trapd = snmp.createTrapListener();

trapd.on('trap', function(msg){

   var now = new Date();
   console.log("Trap Received " + now);
   console.log(util.inspect(snmp.message.serializer(msg)['pdu'], false, null));
});

trapd.bind({family: 'udp4', port: 162});

}
catch( e )
{
  console.error( "There was a problem :" + e );
}
console.log( 'Done' );
