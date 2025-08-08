/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILanguageModelProvider, ILanguageModelInfo, ILanguageModelChatRequest, ILanguageModelChatResponse } from '../common/languageModelService';
import { ModelConfig } from '../../../types';
import { ModelManager } from '../../../models/modelManager';
import { InferenceEngine } from '../../../models/inferenceEngine';
import { Disposable } from '../../../util/common/lifecycle';

/**
 * Local language model provider for Bronx
 */
export class BronxLocalModelProvider extends Disposable implements ILanguageModelProvider {
	private modelManager: ModelManager;
	private inferenceEngine: InferenceEngine;

	constructor() {
		super();
		this.modelManager = ModelManager.getInstance();
		this.inferenceEngine = InferenceEngine.getInstance();
	}

	async getModels(): Promise<ILanguageModelInfo[]> {
		const models = this.modelManager.getAvailableModels();
		return models.map(model => this.convertToLanguageModelInfo(model));
	}

	async sendChatRequest(request: ILanguageModelChatRequest): Promise<ILanguageModelChatResponse> {
		if (!request.model) {
			throw new Error('Model must be specified');
		}

		// Build prompt from messages
		const prompt = this.buildPromptFromMessages(request.messages);

		// Generate response using inference engine
		const response = await this.inferenceEngine.generateResponse({
			prompt,
			model: request.model,
			maxTokens: request.maxTokens || 2048,
			temperature: request.temperature || 0.7,
			context: ''
		});

		return {
			content: response.text,
			finishReason: 'stop',
			usage: {
				promptTokens: Math.floor(prompt.length / 4), // Rough estimate
				completionTokens: Math.floor(response.text.length / 4),
				totalTokens: Math.floor((prompt.length + response.text.length) / 4)
			}
		};
	}

	async countTokens(text: string, model?: string): Promise<number> {
		// Simple token counting - roughly 4 characters per token
		return Math.floor(text.length / 4);
	}

	async isModelAvailable(modelId: string): Promise<boolean> {
		const models = this.modelManager.getAvailableModels();
		return models.some(model => model.modelname === modelId);
	}

	private convertToLanguageModelInfo(model: ModelConfig): ILanguageModelInfo {
		return {
			id: model.modelname,
			name: model.modelname,
			family: model.inference_engine || 'local',
			maxTokens: model.max_tokens || 2048,
			description: model.description,
			vendor: 'Local',
			version: '1.0.0'
		};
	}

	private buildPromptFromMessages(messages: Array<{ role: string; content: string }>): string {
		let prompt = '';
		
		for (const message of messages) {
			switch (message.role) {
				case 'system':
					prompt += `System: ${message.content}\n\n`;
					break;
				case 'user':
					prompt += `User: ${message.content}\n\n`;
					break;
				case 'assistant':
					prompt += `Assistant: ${message.content}\n\n`;
					break;
			}
		}

		prompt += 'Assistant:';
		return prompt;
	}
}
