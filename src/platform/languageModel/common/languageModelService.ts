/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../util/common/services';
import { IDisposable } from '../../../util/common/lifecycle';

/**
 * Interface for language model chat messages
 */
export interface ILanguageModelChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

/**
 * Interface for language model chat requests
 */
export interface ILanguageModelChatRequest {
	messages: ILanguageModelChatMessage[];
	model?: string;
	maxTokens?: number;
	temperature?: number;
	stream?: boolean;
}

/**
 * Interface for language model chat responses
 */
export interface ILanguageModelChatResponse {
	content: string;
	finishReason?: string;
	usage?: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

/**
 * Interface for language model information
 */
export interface ILanguageModelInfo {
	id: string;
	name: string;
	family: string;
	maxTokens: number;
	description?: string;
	vendor?: string;
	version?: string;
}

/**
 * Interface for language model provider
 */
export interface ILanguageModelProvider extends IDisposable {
	/**
	 * Get available models
	 */
	getModels(): Promise<ILanguageModelInfo[]>;

	/**
	 * Send a chat request
	 */
	sendChatRequest(request: ILanguageModelChatRequest): Promise<ILanguageModelChatResponse>;

	/**
	 * Count tokens in a message
	 */
	countTokens(text: string, model?: string): Promise<number>;

	/**
	 * Check if a model is available
	 */
	isModelAvailable(modelId: string): Promise<boolean>;
}

/**
 * Service for accessing language models
 */
export interface ILanguageModelService {
	/**
	 * Register a language model provider
	 */
	registerProvider(providerId: string, provider: ILanguageModelProvider): IDisposable;

	/**
	 * Get available models from all providers
	 */
	getAvailableModels(): Promise<ILanguageModelInfo[]>;

	/**
	 * Send a chat request to a specific model
	 */
	sendChatRequest(request: ILanguageModelChatRequest): Promise<ILanguageModelChatResponse>;

	/**
	 * Count tokens for a specific model
	 */
	countTokens(text: string, modelId?: string): Promise<number>;
}

export const ILanguageModelService = createDecorator<ILanguageModelService>('languageModelService');
