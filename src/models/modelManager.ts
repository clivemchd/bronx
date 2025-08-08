import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ModelConfig, ModelDownloadProgress } from '../types';
import { ConfigManager } from '../config/settings';
import { ModelDownloader } from './modelDownloader';

export class ModelManager {
    private static instance: ModelManager;
    private configManager: ConfigManager;
    private modelDownloader: ModelDownloader;
    private downloadProgress: Map<string, ModelDownloadProgress> = new Map();
    private onDownloadProgressEmitter = new vscode.EventEmitter<ModelDownloadProgress>();
    public readonly onDownloadProgress = this.onDownloadProgressEmitter.event;

    private constructor() {
        this.configManager = ConfigManager.getInstance();
        this.modelDownloader = ModelDownloader.getInstance();
    }

    public static getInstance(): ModelManager {
        if (!ModelManager.instance) {
            ModelManager.instance = new ModelManager();
        }
        return ModelManager.instance;
    }

    public async initializeModelsDirectory(): Promise<void> {
        const modelsPath = this.getModelsPath();
        if (!fs.existsSync(modelsPath)) {
            fs.mkdirSync(modelsPath, { recursive: true });
        }
    }

    public getModelsPath(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const basePath = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();
        return path.resolve(basePath, this.configManager.getModelPath());
    }

    public getAvailableModels(): ModelConfig[] {
        return this.configManager.getConfig().supported_models.map(model => ({
            ...model,
            downloaded: this.isModelDownloaded(model)
        }));
    }

    public isModelDownloaded(model: ModelConfig): boolean {
        const modelPath = path.join(this.getModelsPath(), model.modelname);
        return fs.existsSync(modelPath);
    }

    public async downloadModel(model: ModelConfig): Promise<void> {
        try {
            await this.modelDownloader.downloadFromHuggingFace(
                model,
                this.getModelsPath(),
                (progress) => {
                    this.downloadProgress.set(model.modelname, progress);
                    this.onDownloadProgressEmitter.fire(progress);
                }
            );

            // Update model config to mark as downloaded
            const updatedModel = { ...model, downloaded: true };
            this.configManager.addModel(updatedModel);

        } catch (error) {
            const progress: ModelDownloadProgress = {
                modelName: model.modelname,
                progress: 0,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            this.onDownloadProgressEmitter.fire(progress);
            throw error;
        }
    }

    public async deleteModel(modelName: string): Promise<void> {
        const modelPath = path.join(this.getModelsPath(), modelName);
        if (fs.existsSync(modelPath)) {
            fs.rmSync(modelPath, { recursive: true, force: true });
        }

        // Update model config
        const model = this.configManager.getModelByName(modelName);
        if (model) {
            const updatedModel = { ...model, downloaded: false };
            this.configManager.addModel(updatedModel);
        }
    }

    public getDownloadProgress(modelName: string): ModelDownloadProgress | undefined {
        return this.downloadProgress.get(modelName);
    }

    public async validateModel(model: ModelConfig): Promise<boolean> {
        const modelPath = path.join(this.getModelsPath(), model.modelname);
        
        if (!fs.existsSync(modelPath)) {
            return false;
        }

        // In a real implementation, this would validate the model files
        // For now, just check if the directory exists and has files
        const files = fs.readdirSync(modelPath);
        return files.length > 0;
    }

    public getModelSize(model: ModelConfig): number {
        const modelPath = path.join(this.getModelsPath(), model.modelname);
        
        if (!fs.existsSync(modelPath)) {
            return 0;
        }

        let totalSize = 0;
        const files = fs.readdirSync(modelPath);
        
        for (const file of files) {
            const filePath = path.join(modelPath, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        }

        return totalSize;
    }
}
