# Controlling SPI LEDs with the xPico Wi-Fi

## Summary
This is a module for the xPico Wi-Fi SDK which uses the SPI interface to control Dotstar LEDs. You can find more information from Adafruit here: https://learn.adafruit.com/adafruit-dotstar-leds

## Installation instructions
Put this source code in your c:\xpicowifi\custom\module\dotstar_strip directory. Create a project in c:\xpicowifi\custom\project that has dotstar_strip as one of the modules in the modules.make file. Build the project per the SDK instructions, and flash the firmware into an xPico Wi-Fi.

Make the following connections between the xPico Wi-Fi board and the Dotstar LED strip:
* 5V on strip: 3.3V on board
* GND on strip: GND on board
* CI on strip: SPI_CLK on board
* DI on strip: SPI_MOSI on board

5V vs. 3.3V NOTE: The Dotstar LED strips are supposed to work with 5V. While in testing for demos they have always worked at 3.3, your mileage may vary. You might need to give 5V to the LED strip (and 3.3V to the xPico Wi-Fi), which will require level shifters on the two SPI pins. This will definitely be required for any production board.

## What it's doing
The entry point of the module is dotstar_strip_module_initialization, and you can see that it does a few things:

* Registers the module
* Registers the SPI protocol

Registering the module makes sure that the Lantronix Software Suite takes certain actions, like loading the custom pages into the built-in web server.

Registering the SPI protocol allows the user to select the DotStar LED as the protocol used for the SPI port. Using protocols instead of hard-coding the module to use the SPI port would allow you to create a device that has multiple uses for the SPI port, and select them via the web or XML configuration.

## Usage
After loading the custom firmware onto the device, open the web server. You will see that a new tab named "DotStar LED" has been added to the web configuration.

![Configuration](/docs/web_tab.png?raw=true)

Enter a port number that you want the xPico Wi-Fi to listen for UDP packets to control the LEDs and reboot the device.