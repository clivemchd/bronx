# Bronx - Local AI Assistant for VS Code

Bronx is a VS Code extension that provides a chat interface for interacting with local open-source language models. Run AI models locally on your machine without requiring external APIs or sign-ups.

## Features

- 🤖 **Local AI Models**: Run open-source language models locally
- 💬 **Chat Interface**: Integrated chat panel in VS Code
- 🔧 **Code Integration**: Insert generated code directly into your editor
- 📦 **Model Management**: Download and manage multiple models
- 🚀 **No Sign-ups**: Works completely offline after initial setup
- ⚡ **Multiple Engines**: Support for llama.cpp, ONNX Runtime, and more

## Getting Started

### 1. Install the Extension

Install Bronx from the VS Code marketplace or build from source.

### 2. Open the Chat Panel

- Use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for "Bronx: Open Chat"
- Or click on the Bronx Chat panel in the secondary sidebar

### 3. Download a Model

1. Click the model selector dropdown in the chat panel
2. Use "Bronx: Download Model" command to download your first model
3. Start with smaller models like `qwen2.5-coder-1.5b` for faster responses

### 4. Start Chatting

- Select a downloaded model from the dropdown
- Type your questions or requests in the chat input
- Use code suggestions by clicking "Insert" on code blocks

## Supported Models

Bronx comes pre-configured with several popular open-source models:

- **Qwen2.5-Coder (1.5B)** - Fast and efficient coding model
- **Qwen2.5-Coder (7B)** - Balanced performance coding model  
- **Code Llama (7B)** - Meta's specialized coding model
- **Phi-3 Mini** - Microsoft's lightweight model

## Commands

- `Bronx: Open Chat` - Open the chat panel
- `Bronx: Download Model` - Download a new model
- `Bronx: Manage Models` - View and manage downloaded models
- `Bronx: Clear Chat` - Clear chat history
- `Bronx: Open Settings` - Open extension settings

## Settings

Configure Bronx through VS Code settings:

```json
{
  "bronx.localModelPath": "./models",
  "bronx.defaultModel": "qwen2.5-coder-1.5b",
  "bronx.enableCodeEditing": true,
  "bronx.autoDownloadModels": true,
  "bronx.maxTokens": 2048,
  "bronx.temperature": 0.7
}
```

## Features in Detail

### Chat Interface

- Clean, VS Code-themed chat interface
- Syntax highlighting for code blocks
- Copy and insert code directly into your editor
- Persistent chat history per session

### Model Management

- Download models from Hugging Face (simulated in development)
- View download progress
- Manage local model storage
- Switch between models seamlessly

### Code Integration

- Send current file context to the model
- Include selected code in your prompts
- Insert generated code at cursor position
- Automatic code formatting after insertion

### Context Awareness

Bronx automatically includes relevant context in your conversations:
- Current file and language
- Selected code snippets
- Cursor position context
- Recent chat history

## Development

### Building from Source

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the extension: `pnpm run compile`
4. Run in development: Press F5 to launch Extension Development Host

### Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── chat/
│   └── chatPanelProvider.ts  # Webview chat interface
├── models/
│   ├── modelManager.ts       # Model storage and management
│   ├── modelDownloader.ts    # Download utilities
│   └── inferenceEngine.ts    # Model inference
├── config/
│   └── settings.ts          # Configuration management
├── types/
│   └── index.ts            # TypeScript type definitions
└── webview/
    └── chat.html           # Chat UI HTML/CSS/JS
```

## Roadmap

- [ ] Real HuggingFace model downloading
- [ ] llama.cpp integration for actual inference
- [ ] ONNX Runtime support
- [ ] Transformers.js support
- [ ] Custom model configurations
- [ ] Multi-turn conversations with context
- [ ] Code completion integration
- [ ] Plugin system for custom models

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This is a development version with simulated model functionality. Real model inference capabilities are planned for future releases.
