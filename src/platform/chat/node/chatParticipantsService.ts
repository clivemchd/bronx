/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IChatParticipantsService, IChatParticipant, IChatParticipantContext, IChatParticipantResponse } from '../common/chatParticipants';
import { IDisposable } from '../../../util/common/lifecycle';

/**
 * Implementation of chat participants service
 */
export class ChatParticipantsService implements IChatParticipantsService {
	private _participants = new Map<string, IChatParticipant>();

	registerParticipant(participant: IChatParticipant): IDisposable {
		this._participants.set(participant.id, participant);

		return {
			dispose: () => {
				this._participants.delete(participant.id);
				participant.dispose();
			}
		};
	}

	getParticipants(): IChatParticipant[] {
		return Array.from(this._participants.values());
	}

	getParticipant(id: string): IChatParticipant | undefined {
		return this._participants.get(id);
	}

	async handleRequest(participantId: string, context: IChatParticipantContext, token: vscode.CancellationToken): Promise<IChatParticipantResponse> {
		const participant = this._participants.get(participantId);
		if (!participant) {
			throw new Error(`Chat participant '${participantId}' not found`);
		}

		return await participant.handleRequest(context, token);
	}

	dispose(): void {
		for (const participant of this._participants.values()) {
			participant.dispose();
		}
		this._participants.clear();
	}
}
