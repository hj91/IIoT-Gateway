# node-red-contrib-add
A <a href="http://nodered.org/">Node-RED</a> node to calculate sum of incoming numerical values.

This node is based on <a href="https://github.com/eisbehr-/node-red-average/">Eisbehr's node-red-contrib-average</a>.

## Install

Use the "Manage palette" option inside Node-RED, or within your Node-RED user directory (typically `~/.node-red`), run the command:

`npm install node-red-contrib-add`

## Usage

Calculate the sum of incoming `msg.payload` values.

Messages not containing a valid numeric value will be rejected.

Will return the current sum of all `msg.payload` values as output `msg.payload`. Every other data will be pushed through.

The sum can be reset with an incoming message that contains `msg.reset`. Then all stored data will be removed and the initial sum starts at zero again.

Sample Node-RED flow is included in /examples folder 

## License

This project is licensed under the Apache 2.0 license.


## Author 

Harshad Joshi @ Bufferstack.IO Analytics Technology LLP, Pune
