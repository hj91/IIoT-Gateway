/**

 analog-alarm.js - Copyright 2023 Harshad Joshi and Bufferstack.IO Analytics Technology LLP, Pune

 Licensed under the GNU General Public License, Version 3.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.gnu.org/licenses/gpl-3.0.html

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.


 **/

module.exports = function(RED) {
    function AnalogAlarmNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var previousStatus = 'Normal'; // track the previous status for cleared alarm logging
        var enableCheck = false; // track if the check is enabled or not

        node.on('input', function(msg) {
            try {
                if (msg.topic === "enable") {
                    enableCheck = msg.payload;
                    node.status({fill: "blue", shape: "ring", text: "Node Enabled"});
                    return;
                }

                if (!enableCheck) {
                    node.status({fill: "blue", shape: "ring", text: "Node disabled"});
                    return;
                }

                // Parse the config values from the node
                var hiLimit = parseFloat(config.hiLimit);
                var hihiLimit = parseFloat(config.hihiLimit);
                var loLimit = parseFloat(config.loLimit);
                var loloLimit = parseFloat(config.loloLimit);
                var deadband = parseFloat(config.deadband); // Include deadband
                var areaName = config.areaName;
                var alarmDescription = config.alarmDescription;

                // Parse the incoming value
                var currentValue = parseFloat(msg.payload);

                // Logic modified for handling edge cases too 
                var alarmStatus = previousStatus;
                var limitStatus = "";
                if (currentValue >= hihiLimit) {
                    alarmStatus = 'HiHi';
                    limitStatus = hihiLimit;
                } else if (currentValue < hihiLimit - deadband && currentValue >= hiLimit) {
                    alarmStatus = 'Hi';
                    limitStatus = hiLimit;
                } else if (currentValue < loLimit && currentValue >= loloLimit) {
                    alarmStatus = 'Lo';
                    limitStatus = loLimit;
                } else if (currentValue <= loloLimit) {
                    alarmStatus = 'LoLo';
                    limitStatus = loloLimit;
                } else {
                    alarmStatus = 'Normal';
                }

                // Log alarm cleared events
                if (previousStatus !== 'Normal' && alarmStatus === 'Normal') {
                    node.warn(`${previousStatus} alarm cleared.`);
                }

                // Display status on the node
                node.status({fill: alarmStatus === 'Normal' ? "green" : "red", shape: "ring", text: alarmStatus});

                if (previousStatus !== alarmStatus) {
                    var outputMsg = {
                        area: areaName,
                        description: alarmDescription,
                        value: currentValue,
                        limitConfig: limitStatus,
                        status: alarmStatus
                    };

                    node.send({payload: outputMsg});
                }

                previousStatus = alarmStatus;

            } catch (error) {
                node.error("An error occurred: " + error.message);
                node.status({fill: "red", shape: "ring", text: "Error occurred"});
            }
        });
    }
    RED.nodes.registerType("analog-alarm", AnalogAlarmNode);
};

