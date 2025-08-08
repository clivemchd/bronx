/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Service identifier for dependency injection
 */
export interface ServiceIdentifier<T> {
	(...args: any[]): void;
	type: T;
}

/**
 * Create a service identifier
 */
export function createServiceIdentifier<T>(name: string): ServiceIdentifier<T> {
	const id = function (...args: any[]) {
		// This function is used as the service identifier
	} as ServiceIdentifier<T>;
	
	// Set a property to identify this service
	(id as any)._serviceName = name;
	return id;
}

/**
 * Decorator for marking a parameter as a service dependency
 */
export function createDecorator<T>(serviceId: string): ServiceIdentifier<T> {
	return createServiceIdentifier<T>(serviceId);
}
