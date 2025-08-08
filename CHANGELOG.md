# Change Log

All notable changes to the "bronx" extension will be documented in this file.

## [0.0.1] - 2025-08-08

### Added
- 🚀 **Initial Release** - Bronx VS Code Extension for local AI chat
- 💬 **Chat Interface** - Integrated webview chat panel with VS Code theming
- 🤖 **Model Management** - Support for multiple open-source language models
  - Qwen2.5-Coder (1.5B & 7B)
  - Code Llama (7B)
  - Phi-3 Mini
- 📦 **Model Download System** - Simulated model downloading with progress tracking
- 🔧 **Code Integration** 
  - Insert generated code directly into editor
  - Send current file context to AI
  - Include selected code in prompts
  - Automatic code formatting
- ⚙️ **Configuration** - Comprehensive settings for model behavior
- 🎯 **Context Awareness** - Automatic inclusion of editor context
- 📝 **Chat History** - Persistent conversation history per session
- 🎨 **VS Code Integration** - Native look and feel with VS Code theming

### Technical Features
- TypeScript-based architecture
- Modular component design
- Event-driven model management
- Webview-based chat interface
- Configuration management system
- Extensible inference engine architecture

### Development Tools
- Setup script for easy initialization
- Comprehensive build system
- Watch mode for development
- Lint and type checking
- Test infrastructure

### Commands Added
- `Bronx: Open Chat` - Open the chat panel
- `Bronx: Download Model` - Download a new model  
- `Bronx: Manage Models` - View and manage downloaded models
- `Bronx: Clear Chat` - Clear chat history
- `Bronx: Open Settings` - Open extension settings

### Settings Added
- `bronx.localModelPath` - Local model storage path
- `bronx.defaultModel` - Default model selection
- `bronx.enableCodeEditing` - Enable/disable code editing features
- `bronx.autoDownloadModels` - Auto-download models when selected
- `bronx.maxTokens` - Maximum tokens for responses
- `bronx.temperature` - Temperature for model inference

### Known Limitations
- Simulated model inference (real inference planned for future releases)
- Placeholder model downloading (real HuggingFace integration planned)
- No actual llama.cpp or ONNX integration yet

### Future Roadmap
- Real HuggingFace model downloading
- llama.cpp integration for actual inference
- ONNX Runtime support
- Transformers.js support
- Custom model configurations
- Code completion integration