/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IExtensionContribution } from '../../common/contributions';
import { ModelManager } from '../../../models/modelManager';
import { Disposable } from '../../../util/common/lifecycle';

/**
 * Model management feature
 */
export class ModelManagementFeature extends Disposable implements IExtensionContribution {
	readonly id = 'modelManagement';

	constructor() {
		super();
	}

	async activate(): Promise<void> {
		console.log('ModelManagementFeature: Activating...');
		
		// Initialize model manager
		const modelManager = ModelManager.getInstance();
		await modelManager.initializeModelsDirectory();
		
		console.log('ModelManagementFeature: Activated');
	}
}
