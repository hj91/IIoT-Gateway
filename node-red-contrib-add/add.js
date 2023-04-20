module.exports = function(RED) {
    "use strict";

    function add(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.topic = config.topic;
        this.add = 0;

        this.on("input", function(msg) {
            if( msg.hasOwnProperty("payload") ) {
                var input = Number(msg.payload);

                // handle reset
                if( msg.hasOwnProperty("reset") && msg.reset ) {
                    node.add = 0;

                    msg.payload = 0;
                    node.send(msg);
                }

                // handle input
                else if( !isNaN(input) && isFinite(input) ) {
                    node.add += input;

                    msg.payload = node.add;

                    // overwrite topic if configured
                    if( node.topic ) {
                        msg.topic = node.topic;
                    }

                    node.send(msg);
                }

                // everything else
                else {
                    node.log("Not a number: " + msg.payload);
                }
            }
        });
    }

    RED.nodes.registerType("add", add);
};

