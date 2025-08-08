/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { ServiceCollection, InstantiationService } from './platform/instantiation/node/instantiationService';
import { ILanguageModelService } from './platform/languageModel/common/languageModelService';
import { LanguageModelService } from './platform/languageModel/node/languageModelService';
import { IChatParticipantsService } from './platform/chat/common/chatParticipants';
import { ChatParticipantsService } from './platform/chat/node/chatParticipantsService';
import { ContributionCollection, IExtensionContributionFactory } from './extension/common/contributions';
import { getBronxContributions } from './extension/contributions/bronxContributions';

/**
 * Extension activation configuration
 */
interface IExtensionActivationConfiguration {
	context: vscode.ExtensionContext;
	contributions: IExtensionContributionFactory[];
}

/**
 * Main extension activation function following VS Code Copilot Chat architecture
 */
export async function activate(context: vscode.ExtensionContext) {
	console.log('Bronx extension is now active!');

	// Create service collection and register core services
	const services = new ServiceCollection();
	registerServices(services, context);

	// Create instantiation service
	const instantiationService = services.build();
	context.subscriptions.push(instantiationService);

	// Create and initialize contributions
	const contributions = new ContributionCollection(getBronxContributions(context));
	context.subscriptions.push(contributions);

	// Wait for all activation blockers to complete
	await contributions.waitForActivationBlockers();

	console.log('Bronx extension activation complete!');

	// Return extension API (similar to Copilot Chat)
	return {
		getAPI(version: number) {
			if (version > 1) {
				throw new Error('Invalid Bronx extension API version. Please upgrade Bronx.');
			}
			
			return {
				// Extension API can be exposed here
				version: 1
			};
		}
	};
}

/**
 * Register core services with the service collection
 */
function registerServices(services: ServiceCollection, context: vscode.ExtensionContext): void {
	// Register language model service
	services.setSingleton(ILanguageModelService, new LanguageModelService());

	// Register chat participants service
	services.setSingleton(IChatParticipantsService, new ChatParticipantsService());
}

export function deactivate() {
	console.log('Bronx extension deactivated');
}
