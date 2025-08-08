/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { createDecorator } from '../../../util/common/services';
import { IDisposable } from '../../../util/common/lifecycle';

/**
 * Interface for chat participant request context
 */
export interface IChatParticipantContext {
	/**
	 * The user's message
	 */
	message: string;

	/**
	 * Current editor context
	 */
	editor?: {
		document: vscode.TextDocument;
		selection: vscode.Selection;
		visibleRanges: vscode.Range[];
	};

	/**
	 * Workspace context
	 */
	workspace?: {
		workspaceFolders: readonly vscode.WorkspaceFolder[];
		name?: string;
	};

	/**
	 * Additional context from tools
	 */
	toolContext?: Record<string, any>;
}

/**
 * Interface for chat participant response
 */
export interface IChatParticipantResponse {
	/**
	 * The response text
	 */
	text: string;

	/**
	 * Optional suggested actions
	 */
	actions?: IChatParticipantAction[];

	/**
	 * Optional follow-up prompts
	 */
	followUps?: string[];
}

/**
 * Interface for chat participant actions
 */
export interface IChatParticipantAction {
	/**
	 * Action identifier
	 */
	id: string;

	/**
	 * Display label
	 */
	label: string;

	/**
	 * Action handler
	 */
	handler: () => void | Promise<void>;
}

/**
 * Interface for chat participant
 */
export interface IChatParticipant extends IDisposable {
	/**
	 * Unique identifier for this participant
	 */
	readonly id: string;

	/**
	 * Display name
	 */
	readonly name: string;

	/**
	 * Description of what this participant does
	 */
	readonly description: string;

	/**
	 * Handle a chat request
	 */
	handleRequest(context: IChatParticipantContext, token: vscode.CancellationToken): Promise<IChatParticipantResponse>;

	/**
	 * Get available tools for this participant
	 */
	getAvailableTools?(): string[];
}

/**
 * Interface for chat participants service
 */
export interface IChatParticipantsService {
	/**
	 * Register a chat participant
	 */
	registerParticipant(participant: IChatParticipant): IDisposable;

	/**
	 * Get all registered participants
	 */
	getParticipants(): IChatParticipant[];

	/**
	 * Get a participant by ID
	 */
	getParticipant(id: string): IChatParticipant | undefined;

	/**
	 * Handle a chat request with the appropriate participant
	 */
	handleRequest(participantId: string, context: IChatParticipantContext, token: vscode.CancellationToken): Promise<IChatParticipantResponse>;
}

export const IChatParticipantsService = createDecorator<IChatParticipantsService>('chatParticipantsService');
