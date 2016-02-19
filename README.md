# Controlling SPI LEDs with the xPico Wi-Fi

## Summary
This is a module for the xPico Wi-Fi SDK which uses the SPI interface to control Dotstar LEDs. You can find more information from Adafruit here: https://learn.adafruit.com/adafruit-dotstar-leds

![Demo Picture](/docs/ledStrip.gif?raw=true)

This module uses a few key features of the xPico Wi-Fi software:
* Adding a tab to the configuration manager to add your own configurable items
* Using the SPI master port of the xPico Wi-Fi to send custom data
* Simultaneously listening on ports on the Client (wlan0) and SoftAP (ap0) interfaces

## Installation instructions
Put this source code in c:\xpicowifi\custom\module\dotstar_strip directory. Create a project in c:\xpicowifi\custom\project that has dotstar_strip as one of the modules in the modules.make file. Build the project per the SDK instructions, and flash the firmware into an xPico Wi-Fi.

Make the following connections between the xPico Wi-Fi board and the Dotstar LED strip:
* 5V on strip: 3.3V on board
* GND on strip: GND on board
* CI on strip: SPI_CLK on board
* DI on strip: SPI_MOSI on board

**5V vs. 3.3V NOTE:**
The Dotstar LED strips are supposed to work with 5V. While in testing for demos they have always worked at 3.3, your mileage may vary. You might need to give 5V to the LED strip (and 3.3V to the xPico Wi-Fi), which will require level shifters on the two SPI pins. This will definitely be required for any production board.

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

You will also need to configure the Configurable Pins to be used for SPI. To do so, click on the CPM tab in the configuration manager, then Roles, Configuration, and enable all the pins for SPI.

Go to the SPI tab in the configuration manager, select DotStarLED as the Protocol (this is populated here automatically by the system when the SPI module is registered), and set the clock to 1MHz (1000000) which will automatically find the highest possible divider under 1MHz.

The xPico Wi-Fi will listen to UDP packets on both the AP0 and WLAN0 interface, and send commands via SPI to the LED strip.

### UDP commands

The code parses the UDP packet and determines what to send to the LED strip based on the first byte. Use any UDP client to send the command packet to the IP address of the xPico Wi-Fi and the port configured above. If you would like to synchronize multiple strips, configure all the xPico Wi-Fis to listen on the same port, and use a UDP broadcast.
#### 00: Raw data
The rest of the packet is sent directly to the LED strip. See the documentation from Adafruit on what needs to be sent.
#### 01: All LEDs same pattern
|01|CNT|LED1|LED2|...|LEDn|
|---|---|---|
|Command|Number of LEDs|Pattern|Pattern|Patterns|Pattern|

Where each LED Pattern is 4 bytes:

|111GGGGG|BLUE|GREEN|RED|
|---|---|---|---|
|G is Brightness|Hex|Hex|Hex|

Examples:

30 (0x1F) LEDs and we want them all at half-brightness (GGGGG: 10000b) Green: 01 1F F0 00 FF 00

60 (0x3C) LEDs at half-brightness with a repeated pattern of Red-Green-Blue: 01 3C F0 00 00 FF F0 00 FF 00 F0 FF 00 00


#### 02: Rotating pattern
This allows you to define a pattern, like the command above. But it rotates it, wrapping it around the last LED, after a certain period of time.

|02|CNT|x 20ms|LED1|LED2|...|LEDn|
|---|---|---|
|Command|Number of LEDs|Period|Pattern|Pattern|Patterns|Pattern|

Where the period is in multiples of 20ms.

Example:
30 LEDs in a rainbow, rotating every 100ms: 02 3C 05 F0 00 00 FF F0 80 00 FF F0 FF 00 FF F0 FF 00 00 F0 00 FF 00 F0 00 80 80

#### 03: Bouncing pattern
As above, but instead of repeating the pattern on the whole strip and rotating it, it creates just one pattern and then bounces it from left to right and right to left as the pattern reaches each end.

|03|CNT|x 20ms|LED1|LED2|...|LEDn|
|---|---|---|
|Command|Number of LEDs|Period|Pattern|Pattern|Patterns|Pattern|

Example:
3 red LEDs bouncing back and forth in a strip of 60 total LEDs, each movement every 60ms:
03 3C 03 F0 00 00 AA F0 00 00 AA F0 00 00 AA
