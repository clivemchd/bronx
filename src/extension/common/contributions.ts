/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from '../../util/common/lifecycle';

/**
 * Interface for extension contributions
 */
export interface IExtensionContribution extends IDisposable {
	/**
	 * Unique identifier for this contribution
	 */
	readonly id: string;

	/**
	 * Optional promise that blocks extension activation until resolved
	 */
	readonly activationBlocker?: Promise<any>;

	/**
	 * Called when the contribution should activate
	 */
	activate?(): void | Promise<void>;
}

/**
 * Factory function for creating contributions
 */
export type IExtensionContributionFactory = () => IExtensionContribution;

/**
 * Collection of extension contributions
 */
export class ContributionCollection implements IDisposable {
	private _contributions: IExtensionContribution[] = [];
	private _disposed = false;

	constructor(contributionFactories: IExtensionContributionFactory[]) {
		for (const factory of contributionFactories) {
			try {
				const contribution = factory();
				this._contributions.push(contribution);
			} catch (error) {
				console.error(`Failed to create contribution:`, error);
			}
		}
	}

	/**
	 * Wait for all activation blockers to complete
	 */
	async waitForActivationBlockers(): Promise<void> {
		const blockers = this._contributions
			.map(c => c.activationBlocker)
			.filter(blocker => blocker !== undefined);

		if (blockers.length > 0) {
			await Promise.all(blockers);
		}

		// Activate all contributions
		for (const contribution of this._contributions) {
			try {
				await contribution.activate?.();
			} catch (error) {
				console.error(`Failed to activate contribution ${contribution.id}:`, error);
			}
		}
	}

	dispose(): void {
		if (this._disposed) {
			return;
		}

		this._disposed = true;
		for (const contribution of this._contributions) {
			try {
				contribution.dispose();
			} catch (error) {
				console.error(`Failed to dispose contribution ${contribution.id}:`, error);
			}
		}
		this._contributions = [];
	}
}

/**
 * Helper function to create a contribution factory
 */
export function asContributionFactory<T extends IExtensionContribution>(
	ctor: new (...args: any[]) => T
): IExtensionContributionFactory {
	return () => new ctor();
}
