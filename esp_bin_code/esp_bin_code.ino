#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_NeoPixel.h>
#include "HX711.h"
#include <WiFiClientSecure.h>

//CONFIG
const char* ssid = "ESP32_TEST";
const char* password = "d29fd1a19f4";

const char* mqtt_server = "c1f5ac9342c94c8483a19f93a4baff51.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "mqtt_admin";
const char* mqtt_pass = "Mqttadmin123";
const char* mqtt_topic = "smartbin/data";

// HX711
#define DOUT 4
#define CLK 5
HX711 scale;
float calibration_factor = 729.86f; //calibaration factor
float bin_capacity = 1000.0f;       // 1kg

// NeoPixel
#define PIXEL_PIN 2
#define NUMPIXELS 6 // Pixel 0 = status, 1-5 = fill level
Adafruit_NeoPixel pixels(NUMPIXELS, PIXEL_PIN, NEO_GRB + NEO_KHZ800);

// MQTT
WiFiClientSecure espClient;
PubSubClient client(espClient);

// TIMERS
unsigned long lastStrobe = 0;
bool strobeOn = false;

unsigned long lastBlink = 0;
bool blinkState = false;

unsigned long lastMQTTPublish = 0;
const unsigned long mqttInterval = 5000; // Publish every 5 sec for testing in development environment

// BIN DEFINITIONS
struct Bin {
  String id;
  String name;
  float lat;
  float lon;
  bool isReal;
  float weight;
  float percent;
};

Bin bins[5] = {
  {"019bf21c-8242-4df6-be19-f9320f250054", "Siyane Uyana Middle", 7.086789, 80.038836, false, 0, 0},
  {"75e8c36a-e68d-4571-999c-a5b0079f7a7f", "Weeragula Road first Junction", 7.09418, 80.042211, true, 0, 0},
  {"a4bbb117-6916-448b-8731-a7c5804b04b5", "Gampaha CTB Depot", 7.083142, 80.023129, false, 0, 0},
  {"ca2d927d-8b99-4db8-92aa-d7fb4aa293c0", "Kurunegala Watta Road", 7.092561, 80.029365, false, 0, 0},
  {"fc0194bb-2bba-487b-b179-dd0625c281e6", "Pituwalgoda Road", 7.072084, 80.034644, false, 0, 0}
};

// FUNCTIONS
void strobeStatusPixel(uint8_t r, uint8_t g, uint8_t b, int interval) {
  unsigned long now = millis();
  if (now - lastStrobe >= interval) {
    strobeOn = !strobeOn;
    pixels.setPixelColor(0, strobeOn ? pixels.Color(r, g, b) : pixels.Color(0, 0, 0));
    pixels.show();
    lastStrobe = now;
  }
}

void setFillLevel(float percent) {
  for (int i = 1; i <= 5; i++) {
    float level = i * 20.0f;
    int ledIndex = 6 - i;
    if (percent >= level) {
      pixels.setPixelColor(ledIndex, pixels.Color(255, 0, 0));
    } else if (percent > level - 20.0f) {
      float p = (percent - (level - 20.0f)) / 20.0f;
      int r = p * 255;
      int g = (1 - p) * 255;
      pixels.setPixelColor(ledIndex, pixels.Color(r, g, 0));
    } else {
      pixels.setPixelColor(ledIndex, pixels.Color(0, 0, 0));
    }
  }
  pixels.show();
}

void blinkFillPixels(int interval) {
  unsigned long now = millis();
  if (now - lastBlink >= interval) {
    blinkState = !blinkState;
    uint32_t color = blinkState ? pixels.Color(255, 0, 0) : pixels.Color(0, 0, 0);
    for (int i = 1; i <= 5; i++) {
      int ledIndex = 6 - i;
      pixels.setPixelColor(ledIndex, color);
    }
    pixels.show();
    lastBlink = now;
  }
}

void setup_wifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    strobeStatusPixel(0, 0, 255, 100);
    delay(10);
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    strobeStatusPixel(0, 255, 255, 100);
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
      lastStrobe = millis();
      break;
    } else {
      strobeStatusPixel(255, 0, 0, 500);
      delay(2000);
    }
  }
}

void setup() {
  pixels.begin();
  pixels.clear();
  pixels.show();

  scale.begin(DOUT, CLK);
  scale.set_scale(calibration_factor);
  scale.tare();

  setup_wifi();
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
}

// LOOP
void loop() {
  // Status LED
  if (WiFi.status() != WL_CONNECTED) {
    strobeStatusPixel(0, 0, 255, 100);
  } else if (!client.connected()) {
    reconnectMQTT();
  } else {
    strobeStatusPixel(0, 255, 0, 10);
  }

  // Update real bin weight and LED fill
  for (int i = 0; i < 5; i++) {
    if (bins[i].isReal) {
      bins[i].weight = scale.get_units(10);
      bins[i].weight = max(0.0f, min(bin_capacity, bins[i].weight));
      bins[i].percent = (bins[i].weight / bin_capacity) * 100.0f;

      if (bins[i].percent >= 100.0f) {
        blinkFillPixels(50); // fast blink
      } else {
        setFillLevel(bins[i].percent);
      }
    } else {
      bins[i].weight = random(100, 1000) / 1.0f;
      bins[i].percent = random(10, 90);
    }
  }

  // MQTT publish every 2 seconds
  if (millis() - lastMQTTPublish >= mqttInterval) {
    for (int i = 0; i < 5; i++) {
      char payload[300];
      snprintf(payload, sizeof(payload),
        "{\"id\":\"%s\",\"location_name\":\"%s\",\"latitude\":%.6f,"
        "\"longitude\":%.6f,\"weight\":%.2f,\"fullness\":%.2f,"
        "\"type\":\"%s\"}",
        bins[i].id.c_str(), bins[i].name.c_str(), bins[i].lat, bins[i].lon,
        bins[i].weight, bins[i].percent, bins[i].isReal ? "real" : "simulated");
      client.publish(mqtt_topic, payload);
    }
    lastMQTTPublish = millis();
  }
}
