# VS Code Native Chat Integration Plan

## Overview

This document outlines the plan to integrate Bronx with VS Code's native Chat API, following the patterns established in VS Code Copilot Chat.

## VS Code Chat API Components

### 1. Chat Participants (Chat Agents)

VS Code's Chat API uses "participants" (also called agents) to handle different types of conversations:

```typescript
// Register a chat participant
const participant = vscode.chat.createChatParticipant('bronx', handler);
participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'bronx-logo.svg');
participant.followupProvider = {
    provideFollowups: (result, context, token) => { /* ... */ }
};
```

### 2. Language Model Access

VS Code provides access to language models through the `vscode.lm` API:

```typescript
// Access language models
const models = await vscode.lm.selectChatModels({
    vendor: 'copilot',
    family: 'gpt-4'
});

// Send requests
const response = await models[0].sendRequest(messages, {}, token);
```

### 3. Tool Integration

VS Code supports tool calling through Language Model Tools:

```typescript
// Register tools in package.json
"contributes": {
    "languageModelTools": [
        {
            "name": "bronx_searchCodebase",
            "displayName": "Search Codebase",
            "modelDescription": "Search for code in the user's workspace"
        }
    ]
}
```

## Bronx Integration Strategy

### Phase 1: Basic Chat Participant

**Goal**: Replace webview-based chat with VS Code's native chat interface

```typescript
// src/extension/contributions/chat/vscodeChat.ts
export class VSCodeChatFeature extends Disposable implements IExtensionContribution {
    readonly id = 'vscodeChat';

    async activate(): Promise<void> {
        // Register main Bronx chat participant
        const participant = vscode.chat.createChatParticipant(
            'bronx', 
            this.handleChatRequest.bind(this)
        );
        
        participant.iconPath = this.getIconPath();
        participant.followupProvider = this.createFollowupProvider();
        
        this._register(participant);
    }

    private async handleChatRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        // Use our chat participants service
        const response = await this.chatParticipantsService.handleRequest(
            'bronx',
            {
                message: request.prompt,
                editor: this.getCurrentEditorContext(),
                workspace: this.getWorkspaceContext()
            },
            token
        );

        // Stream the response
        stream.markdown(response.text);
        
        return {
            metadata: {
                command: request.command
            }
        };
    }
}
```

### Phase 2: Local Language Model Provider

**Goal**: Integrate local models with VS Code's language model API

```typescript
// src/platform/languageModel/vscode/vscodeLanguageModelProvider.ts
export class VSCodeLanguageModelProvider implements vscode.LanguageModelChatProvider {
    onDidChange: vscode.Event<void>;

    async provideLanguageModelChat(
        options: vscode.LanguageModelChatRequestOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelChatResponse> {
        // Use our local model provider
        const response = await this.bronxProvider.sendChatRequest({
            messages: options.messages,
            model: options.model || 'qwen2.5-coder-1.5b',
            maxTokens: options.maxTokens,
            temperature: options.temperature
        });

        return {
            stream: this.createResponseStream(response.content)
        };
    }
}

// Register the provider
vscode.lm.registerChatModelProvider('bronx', provider);
```

### Phase 3: Tool Integration

**Goal**: Add tools for code search, workspace analysis, and model management

```typescript
// package.json
{
    "contributes": {
        "languageModelTools": [
            {
                "name": "bronx_searchCode",
                "toolReferenceName": "search",
                "displayName": "Search Code",
                "modelDescription": "Search for code in the current workspace using semantic search",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query for finding relevant code"
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "bronx_analyzeFile",
                "toolReferenceName": "analyze",
                "displayName": "Analyze File",
                "modelDescription": "Analyze the current file or a specific file in the workspace",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "filePath": {
                            "type": "string",
                            "description": "Path to the file to analyze"
                        }
                    }
                }
            },
            {
                "name": "bronx_manageModels",
                "toolReferenceName": "models",
                "displayName": "Manage Models",
                "modelDescription": "Download, list, or switch between available local models"
            }
        ]
    }
}
```

### Phase 4: Advanced Features

**Goal**: Add specialized participants for different contexts

```typescript
// Multiple specialized participants
export const BRONX_PARTICIPANTS = {
    MAIN: 'bronx',           // General coding assistance
    CODE: 'bronx-code',      // Code-specific operations  
    DEBUG: 'bronx-debug',    // Debugging assistance
    MODELS: 'bronx-models'   // Model management
};

// src/extension/contributions/chat/participants/
// ├── mainParticipant.ts
// ├── codeParticipant.ts
// ├── debugParticipant.ts
// └── modelsParticipant.ts
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Create VSCodeChatFeature contribution
- [ ] Implement basic chat participant registration
- [ ] Connect to existing chat participants service
- [ ] Add proper response streaming

### Week 2: Language Model Integration
- [ ] Implement VSCodeLanguageModelProvider
- [ ] Register with vscode.lm API
- [ ] Test local model integration
- [ ] Add model selection UI

### Week 3: Tool System
- [ ] Define tool schemas in package.json
- [ ] Implement tool handlers
- [ ] Add code search tool
- [ ] Add file analysis tool
- [ ] Add model management tool

### Week 4: Polish & Testing
- [ ] Add specialized participants
- [ ] Implement follow-up suggestions
- [ ] Add comprehensive error handling
- [ ] Write integration tests
- [ ] Update documentation

## Migration Strategy

### Parallel Implementation
Keep both webview and native chat systems running in parallel:

```typescript
// src/extension/contributions/bronxContributions.ts
export function getBronxContributions(context: vscode.ExtensionContext): IExtensionContributionFactory[] {
    const contributions = [
        createConversationFeature(),
        createModelManagementFeature(),
    ];

    // Add native chat if supported
    if (vscode.chat && vscode.lm) {
        contributions.push(createVSCodeChatFeature(context));
    } else {
        // Fall back to webview chat
        contributions.push(createChatPanelFeature(context));
    }

    contributions.push(createCommandsFeature(context));
    return contributions;
}
```

### Feature Flags
Use VS Code settings to control which chat interface to use:

```json
{
    "bronx.preferNativeChat": {
        "type": "boolean",
        "default": true,
        "description": "Use VS Code's native chat interface when available"
    }
}
```

### Gradual Rollout
1. **Alpha**: Native chat for developers and early adopters
2. **Beta**: Native chat as default with webview fallback
3. **GA**: Native chat only, remove webview implementation

## Benefits of Native Integration

### 1. **Better User Experience**
- Integrated with VS Code's chat panel
- Consistent with other AI extensions
- Better keyboard navigation and accessibility

### 2. **Enhanced Features**
- Tool calling support
- Rich formatting and interactive elements
- Follow-up suggestions
- Command integration

### 3. **Performance**
- No webview overhead
- Better memory management
- Faster response rendering

### 4. **Future-Proofing**
- Aligned with VS Code's AI vision
- Access to new chat features as they're released
- Better integration with other extensions

## Conclusion

Migrating to VS Code's native Chat API will position Bronx as a modern, well-integrated AI assistant that feels native to VS Code while maintaining its unique local AI capabilities.
