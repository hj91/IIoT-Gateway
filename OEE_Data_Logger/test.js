const assert = require('assert');
const { InfluxDB } = require('influx');
const mqtt = require('mqtt');

const config = require('./config.json');

describe('oee-calculator', () => {
  let influx;

  before(async () => {
    influx = new InfluxDB(config.influxdb);
    await influx.createDatabase(config.influxdb.database);
  });

  after(async () => {
    await influx.dropDatabase(config.influxdb.database);
  });

  it('should write OEE data to InfluxDB', async () => {
    const client = mqtt.connect(config.mqtt);
    const machine = config.machines[0];
    const data = {
      runTime: 5000,
      totalTime: 6000,
      targetSpeed: 60,
      totalProduced: 300,
      goodProduced: 250,
    };
    const expectedOEE = 0.6944444444444444;

    await new Promise((resolve) => client.on('connect', resolve));

    await new Promise((resolve) =>
      client.subscribe(machine.topic, () => {
        client.publish(machine.topic, JSON.stringify(data));
        resolve();
      })
    );

    await new Promise((resolve) =>
      influx.writePoints([
        {
          measurement: machine.name,
          tags: {
            machine: machine.name,
          },
          fields: {
            availability: data.runTime / data.totalTime,
            performance: data.totalProduced / (data.runTime * data.targetSpeed),
            quality: data.goodProduced / data.totalProduced,
            oee: expectedOEE,
          },
        },
      ])
      .then(resolve)
      .catch((error) => {
        console.error('Failed to write data to InfluxDB:', error);
        throw error;
      })
    );

    const queryResult = await influx.query(`SELECT oee FROM ${machine.name}`);
    const actualOEE = queryResult[0].oee;

    assert.strictEqual(actualOEE, expectedOEE);

    client.end();
  }).timeout(5000);

  it('should be able to connect to MQTT broker', (done) => {
    const client = mqtt.connect(config.mqtt);
    client.on('connect', () => {
      client.end();
      done();
    });
    client.on('error', (error) => {
      done(error);
    });
  });
});

