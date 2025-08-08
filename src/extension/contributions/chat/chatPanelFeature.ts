/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IExtensionContribution } from '../../common/contributions';
import { ChatPanelProvider } from '../../../chat/chatPanelProvider';
import { Disposable } from '../../../util/common/lifecycle';

/**
 * Chat panel feature
 */
export class ChatPanelFeature extends Disposable implements IExtensionContribution {
	readonly id = 'chatPanel';

	constructor(private context: vscode.ExtensionContext) {
		super();
	}

	async activate(): Promise<void> {
		console.log('ChatPanelFeature: Activating...');
		
		// Create and register chat panel provider
		const chatProvider = new ChatPanelProvider(this.context);
		
		this._register(vscode.window.registerWebviewViewProvider(
			ChatPanelProvider.viewType,
			chatProvider,
			{
				webviewOptions: {
					retainContextWhenHidden: true
				}
			}
		));
		
		console.log('ChatPanelFeature: Activated');
	}
}
