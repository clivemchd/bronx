export interface BronxConfig {
    supported_models: ModelConfig[];
    local_model_path: string;
    default_model: string;
    enable_code_editing: boolean;
    auto_download_models: boolean;
}

export interface ModelConfig {
    modelname: string;
    path: string;
    inference_engine: 'onnx' | 'llama.cpp' | 'transformers.js';
    max_tokens: number;
    temperature: number;
    size?: string;
    description?: string;
    downloaded?: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
    language: string;
    code: string;
    startLine?: number;
    endLine?: number;
    filename?: string;
}

export interface ChatHistory {
    messages: ChatMessage[];
    model: string;
    sessionId: string;
}

export interface ModelDownloadProgress {
    modelName: string;
    progress: number;
    status: 'downloading' | 'extracting' | 'completed' | 'error';
    error?: string;
}

export interface InferenceRequest {
    prompt: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
    context?: string;
}

export interface InferenceResponse {
    text: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
