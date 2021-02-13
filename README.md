# mqtt_localtuya_fan
LocalTuya to MQTT

First you need to set this up using localtuya to get the device id and key
https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md

Set the device id and key


Tested using WFL-01 3 speed fan/light switch

This is a bit hacky but works!

There are 3 important dps values

1: fan status (true/false)
3: fan speed (1/2/3)
9: light status (true/false)


