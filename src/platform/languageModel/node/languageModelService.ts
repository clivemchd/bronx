/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILanguageModelService, ILanguageModelProvider, ILanguageModelInfo, ILanguageModelChatRequest, ILanguageModelChatResponse } from '../common/languageModelService';
import { IDisposable, DisposableStore } from '../../../util/common/lifecycle';

/**
 * Implementation of the language model service
 */
export class LanguageModelService implements ILanguageModelService {
	private _providers = new Map<string, ILanguageModelProvider>();
	private _disposables = new DisposableStore();

	constructor() {
	}

	registerProvider(providerId: string, provider: ILanguageModelProvider): IDisposable {
		this._providers.set(providerId, provider);
		
		return {
			dispose: () => {
				this._providers.delete(providerId);
				provider.dispose();
			}
		};
	}

	async getAvailableModels(): Promise<ILanguageModelInfo[]> {
		const allModels: ILanguageModelInfo[] = [];
		
		for (const provider of this._providers.values()) {
			try {
				const models = await provider.getModels();
				allModels.push(...models);
			} catch (error) {
				console.error('Error getting models from provider:', error);
			}
		}
		
		return allModels;
	}

	async sendChatRequest(request: ILanguageModelChatRequest): Promise<ILanguageModelChatResponse> {
		if (!request.model) {
			throw new Error('Model must be specified in chat request');
		}

		// Find provider that has this model
		for (const provider of this._providers.values()) {
			try {
				if (await provider.isModelAvailable(request.model)) {
					return await provider.sendChatRequest(request);
				}
			} catch (error) {
				console.error('Error checking model availability:', error);
			}
		}

		throw new Error(`Model ${request.model} not found in any provider`);
	}

	async countTokens(text: string, modelId?: string): Promise<number> {
		if (modelId) {
			// Find provider for specific model
			for (const provider of this._providers.values()) {
				try {
					if (await provider.isModelAvailable(modelId)) {
						return await provider.countTokens(text, modelId);
					}
				} catch (error) {
					console.error('Error counting tokens:', error);
				}
			}
		}

		// Fall back to first available provider
		const providers = Array.from(this._providers.values());
		if (providers.length > 0) {
			return await providers[0].countTokens(text, modelId);
		}

		throw new Error('No language model providers available');
	}

	dispose(): void {
		this._disposables.dispose();
		for (const provider of this._providers.values()) {
			provider.dispose();
		}
		this._providers.clear();
	}
}
