/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ServiceIdentifier } from '../../../util/common/services';
import { IDisposable } from '../../../util/common/lifecycle';

/**
 * Service instantiation interface for dependency injection
 */
export interface IInstantiationService extends IDisposable {
	/**
	 * Create a new instance of a class with its dependencies resolved
	 */
	createInstance<T>(ctor: new (...args: any[]) => T, ...args: any[]): T;

	/**
	 * Invoke a function with dependencies resolved from the service container
	 */
	invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R;

	/**
	 * Get a service by its identifier
	 */
	get<T>(id: ServiceIdentifier<T>): T;
}

/**
 * Accessor for services during function invocation
 */
export interface ServicesAccessor {
	get<T>(id: ServiceIdentifier<T>): T;
}

/**
 * Service collection for building the instantiation service
 */
export interface IServiceCollection {
	set<T>(id: ServiceIdentifier<T>, ctor: new (...args: any[]) => T): void;
	setSingleton<T>(id: ServiceIdentifier<T>, instance: T): void;
}
