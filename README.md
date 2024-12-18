# OpenAI WebRTC API Starter Kit

This Starter Kit empowers developers to build modern, real-time applications effortlessly. Designed with simplicity and versatility in mind, this kit provides everything you need to create seamless, voice-interactive AI chat interfaces with real-time audio streaming and text responses.

OpenAI's latest WebRTC APIs, introduced on Day 9 of "12 Days of OpenAI" (December 17, 2024), are at the core of this starter kit, ensuring you can deliver exceptional user experiences. For more information, visit the [OpenAI WebRTC documentation](https://platform.openai.com/docs/guides/realtime-webrtc).

## 🌟 Why Use This Starter Kit?

When building real-time applications, efficiency, scalability, and ease of use are critical. With the OpenAI WebRTC API Starter Kit, you can:

- Quickly set up **real-time voice communication** between users and AI.
- Utilize **WebRTC's peer-to-peer connectivity** for low-latency interactions.
- Monitor real-time events with **live status updates**.
- Enjoy a **clean and responsive UI** designed for modern applications.


## 🚀 Getting Started

### Prerequisites

To get started, you'll need:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- An **OpenAI API key** with WebRTC API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gabrimatic/OpenAI-WebRTC-API-Starter-Kit.git
cd OpenAI-WebRTC-API-Starter-Kit
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment:
Create a `.env` file in the root directory and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the server:
```bash
npm start
```

5. Open `index.html` in your browser or serve it using a local server.

#### GET /session
Retrieves an ephemeral token for OpenAI WebRTC API authentication.

**Response:**
```json
{
  "client_secret": {
    "value": "ephemeral_token_value"
  }
}
```

### WebRTC Events

The starter kit supports essential WebRTC events, such as:

- Connection state updates
- ICE connection changes
- Data channel messages
- Real-time audio stream handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

Created and maintained by [Hossein Yousefpour](https://gabrimatic.info "Hossein Yousefpour")

&copy; All rights reserved.
