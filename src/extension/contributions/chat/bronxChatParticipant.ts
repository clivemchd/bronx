/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IChatParticipant, IChatParticipantContext, IChatParticipantResponse } from '../../../platform/chat/common/chatParticipants';
import { ILanguageModelService } from '../../../platform/languageModel/common/languageModelService';
import { Disposable } from '../../../util/common/lifecycle';

/**
 * Main Bronx chat participant
 */
export class BronxChatParticipant extends Disposable implements IChatParticipant {
	readonly id = 'bronx';
	readonly name = 'Bronx';
	readonly description = 'Local AI assistant for VS Code';

	constructor(private languageModelService: ILanguageModelService) {
		super();
	}

	async handleRequest(context: IChatParticipantContext, token: vscode.CancellationToken): Promise<IChatParticipantResponse> {
		try {
			// Build messages for the language model
			const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
				{
					role: 'system',
					content: 'You are a helpful AI coding assistant integrated into VS Code. Provide clear, accurate, and helpful responses. When providing code, use proper markdown formatting with language identifiers. Be concise but thorough in your explanations.'
				}
			];

			// Add editor context if available
			if (context.editor) {
				let contextText = `Current file: ${context.editor.document.fileName}\n`;
				contextText += `Language: ${context.editor.document.languageId}\n\n`;

				if (!context.editor.selection.isEmpty) {
					const selectedText = context.editor.document.getText(context.editor.selection);
					contextText += `Selected code:\n\`\`\`${context.editor.document.languageId}\n${selectedText}\n\`\`\`\n\n`;
				}

				messages.push({
					role: 'system',
					content: `Context from the current editor:\n${contextText}`
				});
			}

			// Add user message
			messages.push({
				role: 'user',
				content: context.message
			});

			// Get available models
			const models = await this.languageModelService.getAvailableModels();
			if (models.length === 0) {
				throw new Error('No language models available');
			}

			// Use the first available model
			const model = models[0];

			// Send request to language model
			const response = await this.languageModelService.sendChatRequest({
				messages,
				model: model.id,
				maxTokens: 2048,
				temperature: 0.7
			});

			// Generate actions for code blocks
			const actions = this.extractCodeActions(response.content, context);

			return {
				text: response.content,
				actions,
				followUps: [
					'Can you explain this in more detail?',
					'Show me an example',
					'How can I improve this code?'
				]
			};

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			return {
				text: `Sorry, I encountered an error: ${errorMessage}`,
				actions: [],
				followUps: []
			};
		}
	}

	getAvailableTools(): string[] {
		return ['codebase', 'editor', 'workspace'];
	}

	private extractCodeActions(content: string, context: IChatParticipantContext) {
		const actions: Array<{ id: string; label: string; handler: () => void }> = [];
		
		// Look for code blocks in the response
		const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
		let match;
		let blockIndex = 0;

		while ((match = codeBlockRegex.exec(content)) !== null) {
			const language = match[1] || 'text';
			const code = match[2];
			blockIndex++;

			actions.push({
				id: `insert-code-${blockIndex}`,
				label: `Insert ${language} code`,
				handler: async () => {
					const editor = vscode.window.activeTextEditor;
					if (!editor) {
						vscode.window.showWarningMessage('No active editor found');
						return;
					}

					const selection = editor.selection;
					await editor.edit(editBuilder => {
						if (selection.isEmpty) {
							editBuilder.insert(selection.active, code);
						} else {
							editBuilder.replace(selection, code);
						}
					});

					// Try to format the inserted code
					try {
						await vscode.commands.executeCommand('editor.action.formatSelection');
					} catch (error) {
						// Formatting failed, but that's okay
					}
				}
			});
		}

		return actions;
	}
}
