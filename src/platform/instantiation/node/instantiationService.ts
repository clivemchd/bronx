/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IInstantiationService as IInstantiationServiceInterface, IServiceCollection, ServicesAccessor } from '../common/instantiation';
import { ServiceIdentifier } from '../../../util/common/services';

/**
 * Implementation of the instantiation service using dependency injection
 */
export class InstantiationService implements IInstantiationServiceInterface {
	private _services = new Map<ServiceIdentifier<any>, any>();
	private _singletons = new Map<ServiceIdentifier<any>, any>();

	constructor(services: Map<ServiceIdentifier<any>, any> = new Map()) {
		this._services = new Map(services);
		this._singletons.set(IInstantiationServiceId, this);
	}

	createInstance<T>(ctor: new (...args: any[]) => T, ...extraArgs: any[]): T {
		const dependencies = this._resolveDependencies(ctor);
		return new ctor(...dependencies, ...extraArgs);
	}

	invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R {
		const accessor: ServicesAccessor = {
			get: <T>(id: ServiceIdentifier<T>) => this.get(id)
		};
		return fn(accessor, ...args);
	}

	get<T>(id: ServiceIdentifier<T>): T {
		// Check singletons first
		if (this._singletons.has(id)) {
			return this._singletons.get(id) as T;
		}

		// Check registered services
		if (this._services.has(id)) {
			const serviceOrCtor = this._services.get(id);
			if (typeof serviceOrCtor === 'function') {
				// Create instance if it's a constructor
				const instance = this.createInstance(serviceOrCtor);
				this._singletons.set(id, instance);
				return instance as T;
			}
			return serviceOrCtor as T;
		}

		throw new Error(`Service not found: ${(id as any)._serviceName || id.toString()}`);
	}

	dispose(): void {
		// Dispose all disposable services
		for (const service of this._singletons.values()) {
			if (service && typeof service.dispose === 'function') {
				try {
					service.dispose();
				} catch (error) {
					console.error('Error disposing service:', error);
				}
			}
		}
		this._singletons.clear();
		this._services.clear();
	}

	private _resolveDependencies(ctor: new (...args: any[]) => any): any[] {
		// In a real implementation, this would use reflection or metadata
		// to determine constructor dependencies. For now, we'll return empty array.
		return [];
	}
}

/**
 * Service collection builder
 */
export class ServiceCollection implements IServiceCollection {
	private _services = new Map<ServiceIdentifier<any>, any>();

	set<T>(id: ServiceIdentifier<T>, ctor: new (...args: any[]) => T): void {
		this._services.set(id, ctor);
	}

	setSingleton<T>(id: ServiceIdentifier<T>, instance: T): void {
		this._services.set(id, instance);
	}

	build(): IInstantiationServiceInterface {
		return new InstantiationService(this._services);
	}
}

// Service identifier for the instantiation service itself
export const IInstantiationServiceId = Symbol('IInstantiationService') as any as ServiceIdentifier<IInstantiationServiceInterface>;
