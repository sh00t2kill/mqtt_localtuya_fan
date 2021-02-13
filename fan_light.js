const TuyAPI = require('tuyapi');

const device = new TuyAPI({
  id: '<<DEVICE ID>>',
  key: '<<DEVICE KEY>>'});

// Find device on network
device.find().then(() => {
  // Connect to device
  device.connect();
});

// Add event listeners
device.on('connected', () => {
  console.log('Connected to device!');
});

device.on('disconnected', () => {
  console.log('Disconnected from device.');
  device.find().then(() => {
    device.connect();
  });
});

device.on('error', error => {
  console.log('Error!', error);
});

const mqtt = require('mqtt');
var options = {
   clientId: 'mqtt-node-js'
}

const client = mqtt.connect('mqtt://<<host>>', options);

var light_on = false;
var fan_on = false;
var fan_speed = 1;
var last_data = false;
var fan_status = "OFF";
var fan_on_payload = "0";
var speed_value = "1";
var sleep = require('sleep');

client.on('connect', () => {
  client.subscribe('study/cmd/light')
  client.subscribe('study/cmd/fan')
  client.subscribe('study/cmd/fan_speed')
});


device.on('data', data => {
  if (data != last_data) {
    console.log(data);
    if (typeof data.dps['1'] !== 'undefined') {
       fan_on = data.dps['1'];
       if (fan_on) {
           fan_on_payload = "1";
       } else {
           fan_on_payload = "0";
       }
    }
    if (typeof data.dps['9'] !== 'undefined') {
        light_on =  data.dps['9'];
    }
    if (typeof data.dps['3'] !== 'undefined') {
        fan_speed = data.dps['3'];
    }

    if (!fan_on) {
        fan_status = "off"
    } else if (fan_speed == "1") {
        fan_status = "low"
    } else if (fan_speed == "2") {
        fan_status = "med"
    } else if (fan_speed == "3") {
        fan_status = "high"
    } else {
        fan_status = "low"
    }

    client.publish('study/state/fan_status', fan_status);
    client.publish('study/state/fan', fan_on_payload);
    client.publish('study/state/fan_speed', fan_status);

    if (light_on) {
        light_status = "1";
    } else {
        light_status = "0";
    }
    client.publish('study/state/light', light_status);

    last_data = data;
  }
});

client.on('message', (topic, message) => {
  (async () => {
    light_on = await device.get({dps: 9});
    fan_on =  await device.get({dps: 1});
    fan_speed = await device.get({dps: 3});
    console.log(`light: ${light_on} fan: ${fan_on} speed: ${fan_speed}`);
  });

  switch (topic) {
    case 'study/cmd/light':
      light_on = message.toString();
      if (light_on == "0") {
         light_on = false;
      }
      if (light_on == "1") {
        light_on = true;
      }
      device.set({dps: 9, set: light_on});
      break;
    case 'study/cmd/fan_speed':
      fan_speed = message.toString();
      if (fan_speed == "low") {
        speed_value = "1";
      } else if (fan_speed == "med") {
        speed_value = "2";
      } else if (fan_speed == "high") {
        speed_value = "3";
      } else {
        speed_value = "1";
      }
      console.log(speed_value);
      console.log(fan_speed);
      if (fan_speed == "off") {
        device.set({dps: 1, set: false});
      } else {
        device.set({dps: 3, set: speed_value});
        device.set({dps: 1, set: true});
      }
      break;
    case 'study/cmd/fan':
      old_state = fan_on;
      fan_on = message.toString();
      if (fan_on == "0") {
        fan_on = false;
      }
      if (fan_on == "1") {
        fan_on = true;
      }
      if (fan_on != old_state) {
          device.set({dps: 1, set: fan_on});
      }
      break;
  }

});
