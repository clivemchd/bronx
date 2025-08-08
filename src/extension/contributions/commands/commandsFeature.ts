/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IExtensionContribution } from '../../common/contributions';
import { ModelManager } from '../../../models/modelManager';
import { ConfigManager } from '../../../config/settings';
import { ChatPanelProvider } from '../../../chat/chatPanelProvider';
import { Disposable } from '../../../util/common/lifecycle';

/**
 * Commands feature
 */
export class CommandsFeature extends Disposable implements IExtensionContribution {
	readonly id = 'commands';

	constructor(private context: vscode.ExtensionContext) {
		super();
	}

	async activate(): Promise<void> {
		console.log('CommandsFeature: Activating...');
		
		const modelManager = ModelManager.getInstance();
		const configManager = ConfigManager.getInstance();
		const chatProvider = new ChatPanelProvider(this.context);

		// Register commands
		this._register(vscode.commands.registerCommand('bronx.openChat', () => {
			vscode.commands.executeCommand('bronx.chatView.focus');
		}));

		this._register(vscode.commands.registerCommand('bronx.clearChat', () => {
			chatProvider.clearChat();
		}));

		this._register(vscode.commands.registerCommand('bronx.downloadModel', async () => {
			const models = configManager.getConfig().supported_models;
			const modelItems = models.map(model => ({
				label: model.modelname,
				description: `${model.size || 'Unknown size'} - ${model.description || 'No description'}`,
				detail: modelManager.isModelDownloaded(model) ? 'Downloaded' : 'Not downloaded',
				model: model
			}));

			const selected = await vscode.window.showQuickPick(modelItems, {
				placeHolder: 'Select a model to download'
			});

			if (selected && !modelManager.isModelDownloaded(selected.model)) {
				await chatProvider.downloadModel(selected.model.modelname);
			}
		}));

		this._register(vscode.commands.registerCommand('bronx.manageModels', async () => {
			const models = modelManager.getAvailableModels();
			const items = models.map(model => ({
				label: model.modelname,
				description: `${model.size || 'Unknown size'}`,
				detail: model.downloaded ? '✓ Downloaded' : '⬇ Not downloaded',
				model: model
			}));

			const selected = await vscode.window.showQuickPick(items, {
				placeHolder: 'Select a model to manage'
			});

			if (selected) {
				const actions = [];
				
				if (selected.model.downloaded) {
					actions.push('Delete');
				} else {
					actions.push('Download');
				}

				const action = await vscode.window.showQuickPick(actions, {
					placeHolder: `What would you like to do with ${selected.model.modelname}?`
				});

				if (action === 'Download') {
					await chatProvider.downloadModel(selected.model.modelname);
				} else if (action === 'Delete') {
					const confirm = await vscode.window.showWarningMessage(
						`Are you sure you want to delete ${selected.model.modelname}?`,
						'Yes', 'No'
					);
					if (confirm === 'Yes') {
						await modelManager.deleteModel(selected.model.modelname);
						vscode.window.showInformationMessage(`Model ${selected.model.modelname} deleted`);
					}
				}
			}
		}));

		this._register(vscode.commands.registerCommand('bronx.openSettings', () => {
			vscode.commands.executeCommand('workbench.action.openSettings', 'bronx');
		}));

		this._register(vscode.commands.registerCommand('bronx.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from Bronx! Use the chat panel to get started.');
		}));
		
		console.log('CommandsFeature: Activated');
	}
}
