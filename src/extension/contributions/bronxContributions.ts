/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IExtensionContributionFactory } from '../common/contributions';
import { ConversationFeature } from './conversation/conversationFeature';
import { ModelManagementFeature } from './models/modelManagementFeature';
import { ChatPanelFeature } from './chat/chatPanelFeature';
import { CommandsFeature } from './commands/commandsFeature';

/**
 * Create conversation feature
 */
export function createConversationFeature(): IExtensionContributionFactory {
	return () => new ConversationFeature(undefined as any, undefined as any);
}

/**
 * Create model management feature
 */
export function createModelManagementFeature(): IExtensionContributionFactory {
	return () => new ModelManagementFeature();
}

/**
 * Create chat panel feature
 */
export function createChatPanelFeature(context: vscode.ExtensionContext): IExtensionContributionFactory {
	return () => new ChatPanelFeature(context);
}

/**
 * Create commands feature
 */
export function createCommandsFeature(context: vscode.ExtensionContext): IExtensionContributionFactory {
	return () => new CommandsFeature(context);
}

/**
 * Get all Bronx extension contributions
 */
export function getBronxContributions(context: vscode.ExtensionContext): IExtensionContributionFactory[] {
	return [
		createConversationFeature(),
		createModelManagementFeature(),
		createChatPanelFeature(context),
		createCommandsFeature(context),
	];
}
