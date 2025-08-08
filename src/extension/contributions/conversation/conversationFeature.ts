/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IExtensionContribution } from '../../common/contributions';
import { ILanguageModelService } from '../../../platform/languageModel/common/languageModelService';
import { IChatParticipantsService } from '../../../platform/chat/common/chatParticipants';
import { BronxLocalModelProvider } from '../../../platform/languageModel/node/bronxLocalModelProvider';
import { BronxChatParticipant } from '../chat/bronxChatParticipant';
import { Disposable } from '../../../util/common/lifecycle';

/**
 * Conversation feature that sets up chat participants and language model integration
 */
export class ConversationFeature extends Disposable implements IExtensionContribution {
	readonly id = 'conversation';

	constructor(
		private languageModelService: ILanguageModelService,
		private chatParticipantsService: IChatParticipantsService
	) {
		super();
	}

	async activate(): Promise<void> {
		console.log('ConversationFeature: Activating...');
		
		// Register local model provider
		const localProvider = new BronxLocalModelProvider();
		this._register(this.languageModelService.registerProvider('bronx-local', localProvider));

		// Register chat participant
		const chatParticipant = new BronxChatParticipant(this.languageModelService);
		this._register(this.chatParticipantsService.registerParticipant(chatParticipant));
		
		console.log('ConversationFeature: Activated');
	}
}
