import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ChatMessage, ModelConfig } from '../types';
import { ModelManager } from '../models/modelManager';
import { InferenceEngine } from '../models/inferenceEngine';
import { ConfigManager } from '../config/settings';

export class ChatPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'bronx.chatView';
    
    private _view?: vscode.WebviewView;
    private modelManager: ModelManager;
    private inferenceEngine: InferenceEngine;
    private configManager: ConfigManager;
    private chatHistory: ChatMessage[] = [];

    constructor(private readonly _extensionContext: vscode.ExtensionContext) {
        this.modelManager = ModelManager.getInstance();
        this.inferenceEngine = InferenceEngine.getInstance();
        this.configManager = ConfigManager.getInstance();
        
        // Listen to model download progress
        this.modelManager.onDownloadProgress(progress => {
            this._view?.webview.postMessage({
                type: 'downloadProgress',
                progress: progress
            });
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionContext.extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (data) => {
                switch (data.type) {
                    case 'getModelList':
                        await this.sendModelList();
                        break;
                    case 'selectModel':
                        await this.selectModel(data.model);
                        break;
                    case 'sendMessage':
                        await this.handleMessage(data.text, data.model);
                        break;
                    case 'insertCode':
                        await this.insertCodeInEditor(data.code);
                        break;
                }
            },
            undefined,
            this._extensionContext.subscriptions
        );

        // Send initial model list
        this.sendModelList();
    }

    private async sendModelList(): Promise<void> {
        const models = this.modelManager.getAvailableModels();
        this._view?.webview.postMessage({
            type: 'modelList',
            models: models
        });
    }

    private async selectModel(modelName: string): Promise<void> {
        try {
            const model = this.configManager.getModelByName(modelName);
            if (!model) {
                throw new Error(`Model ${modelName} not found`);
            }

            if (!this.modelManager.isModelDownloaded(model)) {
                vscode.window.showInformationMessage(`Model ${modelName} is not downloaded. Starting download...`);
                await this.modelManager.downloadModel(model);
            }

            await this.inferenceEngine.loadModel(model);
            
            this._view?.webview.postMessage({
                type: 'modelLoaded',
                model: modelName
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to load model: ${message}`);
            
            this._view?.webview.postMessage({
                type: 'error',
                text: message
            });
        }
    }

    private async handleMessage(text: string, modelName: string): Promise<void> {
        try {
            // Add user message to history
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: text,
                timestamp: new Date()
            };
            this.chatHistory.push(userMessage);

            // Get context from current editor if available
            const context = this.getCurrentEditorContext();
            
            // Generate response
            const response = await this.inferenceEngine.generateResponse({
                prompt: this.buildPrompt(text, context),
                model: modelName,
                maxTokens: 2048,
                temperature: 0.7,
                context: context
            });

            // Add assistant message to history
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.text,
                timestamp: new Date()
            };
            this.chatHistory.push(assistantMessage);

            // Send response to webview
            this._view?.webview.postMessage({
                type: 'response',
                text: response.text
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to generate response: ${message}`);
            
            this._view?.webview.postMessage({
                type: 'error',
                text: message
            });
        }
    }

    private getCurrentEditorContext(): string {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return '';
        }

        const document = editor.document;
        const selection = editor.selection;

        let context = `Current file: ${document.fileName}\n`;
        context += `Language: ${document.languageId}\n\n`;

        if (!selection.isEmpty) {
            // If there's a selection, include it
            const selectedText = document.getText(selection);
            context += `Selected code:\n\`\`\`${document.languageId}\n${selectedText}\n\`\`\`\n\n`;
        } else {
            // Otherwise, include some context around the cursor
            const line = selection.active.line;
            const startLine = Math.max(0, line - 10);
            const endLine = Math.min(document.lineCount - 1, line + 10);
            const range = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
            const contextText = document.getText(range);
            
            context += `Context around cursor (lines ${startLine + 1}-${endLine + 1}):\n\`\`\`${document.languageId}\n${contextText}\n\`\`\`\n\n`;
        }

        return context;
    }

    private buildPrompt(userMessage: string, context: string): string {
        let prompt = '';

        // Add system message
        prompt += 'You are a helpful AI coding assistant integrated into VS Code. ';
        prompt += 'Provide clear, accurate, and helpful responses. ';
        prompt += 'When providing code, use proper markdown formatting with language identifiers. ';
        prompt += 'Be concise but thorough in your explanations.\n\n';

        // Add context if available
        if (context) {
            prompt += `Context from the current editor:\n${context}\n`;
        }

        // Add recent chat history for context
        const recentMessages = this.chatHistory.slice(-6); // Last 6 messages
        if (recentMessages.length > 0) {
            prompt += 'Recent conversation:\n';
            recentMessages.forEach(msg => {
                prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });
            prompt += '\n';
        }

        // Add current user message
        prompt += `User: ${userMessage}\n\nAssistant:`;

        return prompt;
    }

    private async insertCodeInEditor(code: string): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const position = selection.active;

        await editor.edit(editBuilder => {
            if (selection.isEmpty) {
                editBuilder.insert(position, code);
            } else {
                editBuilder.replace(selection, code);
            }
        });

        // Format the inserted code if possible
        try {
            await vscode.commands.executeCommand('editor.action.formatSelection');
        } catch (error) {
            // Formatting failed, but that's okay
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const htmlPath = path.join(this._extensionContext.extensionPath, 'src', 'webview', 'chat.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Generate a nonce for security
        const nonce = this.getNonce();
        html = html.replace(/{{nonce}}/g, nonce);

        return html;
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    public async clearChat(): Promise<void> {
        this.chatHistory = [];
        this._view?.webview.postMessage({
            type: 'clearChat'
        });
    }

    public async downloadModel(modelName: string): Promise<void> {
        const model = this.configManager.getModelByName(modelName);
        if (!model) {
            vscode.window.showErrorMessage(`Model ${modelName} not found`);
            return;
        }

        try {
            await this.modelManager.downloadModel(model);
            await this.sendModelList(); // Refresh the model list
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to download model: ${message}`);
        }
    }
}
