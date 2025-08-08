#!/usr/bin/env node

/**
 * Setup script for Bronx VS Code Extension
 * This script helps initialize the extension and download initial models
 */

const fs = require('fs');
const path = require('path');

function createModelsDirectory() {
    const modelsPath = path.join(process.cwd(), 'models');
    
    if (!fs.existsSync(modelsPath)) {
        fs.mkdirSync(modelsPath, { recursive: true });
        console.log('✓ Created models directory');
    } else {
        console.log('✓ Models directory already exists');
    }
    
    return modelsPath;
}

function createWelcomeFile(modelsPath) {
    const welcomeContent = `# Welcome to Bronx!

This directory will contain your downloaded AI models.

## Getting Started

1. Open VS Code
2. Install the Bronx extension
3. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
4. Run "Bronx: Download Model"
5. Select a model to download
6. Start chatting in the Bronx Chat panel!

## Models

Models will be stored in subdirectories here:
- qwen2.5-coder-1.5b/
- qwen2.5-coder-7b/
- codellama-7b/
- phi-3-mini/

Each model directory contains:
- model files (e.g., model.gguf, model.onnx)
- tokenizer.json
- config.json

## Storage

Models can be quite large (1GB - 15GB+). Make sure you have enough disk space.
Smaller models (1.5B parameters) are recommended for getting started.

Happy coding with AI! 🤖
`;

    const welcomePath = path.join(modelsPath, 'README.md');
    fs.writeFileSync(welcomePath, welcomeContent);
    console.log('✓ Created welcome file in models directory');
}

function main() {
    console.log('🚀 Setting up Bronx VS Code Extension...\n');
    
    try {
        const modelsPath = createModelsDirectory();
        createWelcomeFile(modelsPath);
        
        console.log('\n✅ Setup complete!');
        console.log('\nNext steps:');
        console.log('1. Press F5 to launch the Extension Development Host');
        console.log('2. Open the Command Palette and run "Bronx: Open Chat"');
        console.log('3. Download a model and start chatting!');
        console.log('\nFor more information, see the README.md file.');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createModelsDirectory, createWelcomeFile };
