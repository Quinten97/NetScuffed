# NetScuffed

A cross-platform network diagnostics tool that replicates NetScout functionality on any device.

## Current Features and tasks

1. 🔍 LLDP Scan
   Function: Discover neighboring devices using LLDP.

UI Components:

Scan Button – initiates lldpctl or similar.

Results Table:

Device Name / Hostname

Port ID

System Name

Chassis ID

Capabilities

Refresh Button

Export (JSON/CSV) – optional

2. 🔌 Duplex & Link Speed Check
   Function: Display link status and duplex info for interfaces.

UI Components:

Interface Selector Dropdown

Interface Info Panel:

Interface Name (e.g., eth0)

Link Detected (yes/no)

Speed (e.g., 1000Mb/s)

Duplex Mode (Full/Half)

Refresh Button

Troubleshooting Tip Box – optional suggestions if duplex mismatch is found

3. 📶 Wireless Network Scanner
   Function: Scan for nearby Wi-Fi access points.

UI Components:

Scan Button

AP List Table/Grid:

SSID

Signal Strength (with bar icons or dBm)

Channel

Encryption Type

MAC Address

Sort/Filter by Signal/Channel

Refresh Button

(Use nmcli dev wifi list or iwlist for backend)

4. 📡 Ping & Traceroute Tool
   Function: Basic network connectivity testing.

UI Components:

Target Input Field

Ping Results Panel:

Response time

Packet loss

TTL

Traceroute Panel:

Hop count

IPs & Hostnames

RTT per hop

Run Button

Clear Results Button

5. 🚀 Speed Test
   Function: Measure upload/download speed and latency.

UI Components:

Start Test Button

Speedometer-style Meters or Basic Stats:

Download Mbps

Upload Mbps

Ping (ms)

Progress Spinner or Loader

Server Location Info – optional

(Use speedtest-cli or librespeed backend)

🗂️ Other Shared Components
Sidebar or Tab Nav

Logs/Output Console (optional for nerdy details)

Theme Toggle (dark/light mode – devs love this)

Settings Page (Future) – set scan intervals, interface preferences, etc.
