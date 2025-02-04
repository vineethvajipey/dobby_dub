# Dobby Dub 🧙‍♂️

Dobby Dub is an interactive web application that brings text to life through AI-powered commentary and speech synthesis. Users can input any text or topic, and Dobby - our psycho AI commentator - provides engaging, real-time reactions that are streamed as both text and speech.

## Features

- 🔄 Real-time streaming of AI commentary
- 🗣️ Text-to-speech conversion with natural voice
- ⚡ Live word-by-word display
- 🎵 Audio playback controls
- 🎨 Clean, modern UI with animations

## Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **TypeScript** - Type-safe JavaScript

### AI & Speech
- **Fireworks AI** - LLM for generating Dobby's commentary
- **Eleven Labs** - Text-to-speech synthesis
- **Streaming APIs** - Real-time data delivery

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dobby_dub.git
cd dobby_dub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API keys:
```env
FIREWORKS_API_KEY=your_fireworks_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `FIREWORKS_API_KEY` - API key for Fireworks AI
- `ELEVENLABS_API_KEY` - API key for Eleven Labs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
