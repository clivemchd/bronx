/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Interface for disposable objects
 */
export interface IDisposable {
	dispose(): void;
}

/**
 * Base class for disposable objects
 */
export abstract class Disposable implements IDisposable {
	private _disposed = false;
	private _disposables: IDisposable[] = [];

	protected _register<T extends IDisposable>(disposable: T): T {
		if (this._disposed) {
			disposable.dispose();
		} else {
			this._disposables.push(disposable);
		}
		return disposable;
	}

	dispose(): void {
		if (this._disposed) {
			return;
		}

		this._disposed = true;
		for (const disposable of this._disposables) {
			try {
				disposable.dispose();
			} catch (error) {
				console.error('Error disposing:', error);
			}
		}
		this._disposables = [];
	}

	get isDisposed(): boolean {
		return this._disposed;
	}
}

/**
 * Disposable store for collecting disposables
 */
export class DisposableStore implements IDisposable {
	private _disposables: IDisposable[] = [];
	private _disposed = false;

	add<T extends IDisposable>(disposable: T): T {
		if (this._disposed) {
			disposable.dispose();
		} else {
			this._disposables.push(disposable);
		}
		return disposable;
	}

	dispose(): void {
		if (this._disposed) {
			return;
		}

		this._disposed = true;
		for (const disposable of this._disposables) {
			try {
				disposable.dispose();
			} catch (error) {
				console.error('Error disposing:', error);
			}
		}
		this._disposables = [];
	}
}
