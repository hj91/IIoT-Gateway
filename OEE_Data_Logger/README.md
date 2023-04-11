oee-calculator is a Node.js program that calculates and logs OEE (Overall Equipment Effectiveness) data obtained from an MQTT server to an InfluxDB database.

Installation
Use the package manager npm to install oee-calculator globally.

sudo npm install oee-calculator -g

After installation, the program can be executed by running the oee-calculator command in the terminal.

Configuration
The /etc/oee-calculator/config.json file contains the configuration for the MQTT server and InfluxDB database connections, as well as the topic names for each machine's OEE data.

An example config.json file:

{
  "mqtt": {
    "servers": [
      {
        "host": "localhost",
        "port": 1883,
        "username": "",
        "password": ""
      }
    ]
  },
  "influxdb": {
    "host": "localhost",
    "port": 8086,
    "database": "oee",
    "username": "",
    "password": ""
    },
  "machines": [
    {
      "name": "Machine1",
      "topic": "oee/machine1"
    },
    {
      "name": "Machine2",
      "topic": "oee/machine2"
    }
  ]
}

Edit the /etc/oee-calculator/config.json file to add the proper address for the MQTT broker and InfluxDB server. If the config.json file is not found in the global node_modules directory, the program will exit.

Usage
The expected message sent to each machine's MQTT topic should include JSON data with the following fields: runTime, totalTime, targetSpeed, totalProduced, and goodProduced.

Example JSON input:

{
    "runTime": 3600,
    "totalTime": 4200,
    "targetSpeed": 50,
    "totalProduced": 10000,
    "goodProduced": 9700
}


The input is taken from the MQTT topic and output is logged into the InfluxDB database. This program calculates the OEE from the above parameters.

If the MQTT topic does not contain the required fields, the application will exit.

When the oee-calculator program is executed, it will subscribe to the MQTT topics for each machine listed in the config.json file. If the connection to the MQTT broker and InfluxDB database is successful, the program will log a message indicating that it is connected.

Example output:

Subscribed to topic oee/machine1
Subscribed to topic oee/machine2
It looks good, I am connected to InfluxDB.

Testing
The oee-calculator package includes a test suite built with Mocha. To run the tests, navigate to the root directory of the package and run the following command:

npm test


The tests verify that the package can connect to an MQTT broker and InfluxDB, receive OEE data from a machine, calculate the OEE values correctly, and write the data to InfluxDB.

The tests also check for edge cases such as missing or invalid fields in the MQTT messages, and verify that the data is written to InfluxDB correctly.

The tests are defined in the test.js file in the root directory of the package. You can modify this file or add additional test files as needed to test different aspects of the package.

Before running the tests, make sure to configure the package using the config.json file as described in the Configuration section.


License
This software is licensed under the GPL-3.0 License.

Author
oee-calculator was created by Harshad Joshi for Bufferstack.IO Analytical Technology LLP.
