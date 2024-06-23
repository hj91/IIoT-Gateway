#!/bin/bash

# Update package list and install npm if it's not already installed - package is installed by default on Bufferstack.IO IIoT Gateway
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Installing npm..."
    sudo apt-get update
    sudo apt-get install -y npm
else
    echo "npm is already installed."
fi

# Install node-red-contrib-influxdb globally
echo "Installing node-red-contrib-influxdb globally..."
sudo npm install -g node-red-contrib-influxdb@latest

echo "Installation complete. Run Node-RED and check the influxdb node"
