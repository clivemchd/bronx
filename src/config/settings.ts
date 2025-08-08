import * as vscode from 'vscode';
import { BronxConfig, ModelConfig } from '../types';

export class ConfigManager {
    private static instance: ConfigManager;
    private config: BronxConfig;

    private constructor() {
        this.config = this.loadConfig();
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    private loadConfig(): BronxConfig {
        const configuration = vscode.workspace.getConfiguration('bronx');
        
        return {
            supported_models: this.getDefaultModels(),
            local_model_path: configuration.get('localModelPath', './models'),
            default_model: configuration.get('defaultModel', 'qwen2.5-coder-1.5b'),
            enable_code_editing: configuration.get('enableCodeEditing', true),
            auto_download_models: configuration.get('autoDownloadModels', true)
        };
    }

    private getDefaultModels(): ModelConfig[] {
        return [
            {
                modelname: 'qwen2.5-coder-1.5b',
                path: 'Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF',
                inference_engine: 'llama.cpp',
                max_tokens: 2048,
                temperature: 0.7,
                size: '1.5B',
                description: 'Fast and efficient coding model'
            },
            {
                modelname: 'qwen2.5-coder-7b',
                path: 'Qwen/Qwen2.5-Coder-7B-Instruct-GGUF',
                inference_engine: 'llama.cpp',
                max_tokens: 4096,
                temperature: 0.7,
                size: '7B',
                description: 'Balanced performance coding model'
            },
            {
                modelname: 'codellama-7b',
                path: 'codellama/CodeLlama-7b-Instruct-hf',
                inference_engine: 'llama.cpp',
                max_tokens: 2048,
                temperature: 0.7,
                size: '7B',
                description: 'Meta\'s Code Llama model'
            },
            {
                modelname: 'phi-3-mini',
                path: 'microsoft/Phi-3-mini-4k-instruct-gguf',
                inference_engine: 'llama.cpp',
                max_tokens: 4096,
                temperature: 0.7,
                size: '3.8B',
                description: 'Microsoft\'s lightweight model'
            }
        ];
    }

    public getConfig(): BronxConfig {
        return this.config;
    }

    public updateConfig(updates: Partial<BronxConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }

    public getModelByName(modelName: string): ModelConfig | undefined {
        return this.config.supported_models.find(model => model.modelname === modelName);
    }

    public addModel(model: ModelConfig): void {
        const existingIndex = this.config.supported_models.findIndex(m => m.modelname === model.modelname);
        if (existingIndex >= 0) {
            this.config.supported_models[existingIndex] = model;
        } else {
            this.config.supported_models.push(model);
        }
        this.saveConfig();
    }

    private saveConfig(): void {
        const configuration = vscode.workspace.getConfiguration('bronx');
        configuration.update('localModelPath', this.config.local_model_path, vscode.ConfigurationTarget.Global);
        configuration.update('defaultModel', this.config.default_model, vscode.ConfigurationTarget.Global);
        configuration.update('enableCodeEditing', this.config.enable_code_editing, vscode.ConfigurationTarget.Global);
        configuration.update('autoDownloadModels', this.config.auto_download_models, vscode.ConfigurationTarget.Global);
    }

    public getModelPath(): string {
        return this.config.local_model_path;
    }

    public getDefaultModel(): string {
        return this.config.default_model;
    }
}
