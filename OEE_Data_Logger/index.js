#!/usr/bin/env node

// This application  assumes that the received data object has the following properties: runTime, totalTime, targetSpeed, totalProduced, and goodProduced. You may need to adjust the calculation logic based on the actual data you're receiving from your machines.
// (c) Harshad Joshi, Bufferstack.IO Analytics Technology LLP, 2023

const mqtt = require('mqtt');
const { InfluxDB } = require('influx');
const fs = require('fs');

// Check if config.json exists
if (!fs.existsSync('/etc/oee-calculator/config.json')) {
  console.error('Contact Harshad for details of error CJ00 - Error: config.json file not found');
  process.exit(1);
}

const config = require ('/etc/oee-calculator/config.json');


// Create a new InfluxDB instance with configuration options from the config file
const influx = new InfluxDB(config.influxdb);

// Connect to MQTT broker with configuration options from the config file
let client = mqtt.connect(config.mqtt);

// Handle MQTT client connection errors
client.on('error', (error) => {
  console.error('MQTT client error:', error);
});

// Handle MQTT client reconnects
client.on('reconnect', () => {
  console.log('MQTT client reconnecting...');
});

// Handle MQTT client close
client.on('close', () => {
  console.log('MQTT client disconnected');
});

// Handle incoming MQTT messages
// Handle incoming MQTT messages
client.on('message', (topic, message) => {
  const data = JSON.parse(message);
  const machine = config.machines.find((m) => m.topic === topic);

  if (!machine) {
    console.error(`Received message for unknown topic ${topic}`);
    return;
  }

  // Check if required fields exist in message
  if (!data.runTime || !data.totalTime || !data.targetSpeed || !data.totalProduced || !data.goodProduced) {
    console.error(`Received message for machine ${machine.name} is missing required fields, i am exiting`);
    return;
    process.exit(0);
  }

// Check if required fields exist in message
  if (
    typeof data.runTime !== 'number' ||
    typeof data.totalTime !== 'number' ||
    typeof data.targetSpeed !== 'number' ||
    typeof data.totalProduced !== 'number' ||
    typeof data.goodProduced !== 'number'
  ) {
    console.error(`Received message for machine ${machine.name} contains non-numeric values, i am exiting`);
    return;
    process.exit(0);
  }

  // Calculate OEE values
  const availability = data.runTime / data.totalTime;
  const performance = data.totalProduced / (data.runTime * data.targetSpeed);
  const quality = data.goodProduced / data.totalProduced;
  const oee = availability * performance * quality;

  // Write data to InfluxDB
  influx.getDatabaseNames()
  .then((names) => {
    if (!names.includes(config.influxdb.database)) {
      console.log(`Database '${config.influxdb.database}' does not exist, creating it now...`);
      return influx.createDatabase(config.influxdb.database);
    }
  })
  .then(() => {
    console.log(`Writing data for machine ${machine.name} to InfluxDB`);
    return influx.writePoints([
      {
        measurement: machine.name,
        tags: {
          machine: machine.name,
        },
        fields: {
          availability,
          performance,
          quality,
          oee,
        },
      },
    ]);
  })
  .then(() => {
    console.log(`Successfully wrote data for machine ${machine.name} to InfluxDB`);
  })
  .catch((error) => {
    console.error(`Failed to write data for machine ${machine.name} to InfluxDB:`, error);
  });
}); //db handling code ends 

console.log('\n oee-calculator - Calculate and log OEE data obtained from MQTT server to InfluxDB by Bufferstack.IO Analytics Technology LLP. 2023 \n');

// Subscribe to MQTT topics for each machine listed in the config file
for (let machine of config.machines) {
  client.subscribe(machine.topic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic ${machine.topic}:`, err);
      process.exit(2);
    } else {
      console.log(`Subscribed to topic ${machine.topic}`);
    }
  });
}

// Handle InfluxDB connection errors
influx.getDatabaseNames()
  .then(() => {
    console.log('It looks good, i am connected to InfluxDB');
  })
  .catch((error) => {
    console.error('Contact Harshad for error IDB00 - I am exiting as i failed to connect to InfluxDB:', error);
    process.exit(3);
  });

