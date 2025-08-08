import * as assert from 'assert';
import * as vscode from 'vscode';
import { ModelManager } from '../models/modelManager';
import { ConfigManager } from '../config/settings';
import { InferenceEngine } from '../models/inferenceEngine';

suite('Bronx Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('undefined_publisher.bronx'));
	});

	test('ModelManager singleton pattern', () => {
		const manager1 = ModelManager.getInstance();
		const manager2 = ModelManager.getInstance();
		assert.strictEqual(manager1, manager2, 'ModelManager should be a singleton');
	});

	test('ConfigManager loads default configuration', () => {
		const configManager = ConfigManager.getInstance();
		const config = configManager.getConfig();
		
		assert.ok(config, 'Config should be loaded');
		assert.ok(config.supported_models.length > 0, 'Should have supported models');
		assert.strictEqual(config.default_model, 'qwen2.5-coder-1.5b', 'Default model should be qwen2.5-coder-1.5b');
		assert.strictEqual(config.enable_code_editing, true, 'Code editing should be enabled by default');
	});

	test('ModelManager initializes correctly', async () => {
		const modelManager = ModelManager.getInstance();
		await modelManager.initializeModelsDirectory();
		
		const modelsPath = modelManager.getModelsPath();
		assert.ok(modelsPath, 'Models path should be defined');
		
		const availableModels = modelManager.getAvailableModels();
		assert.ok(availableModels.length > 0, 'Should have available models');
	});

	test('InferenceEngine singleton pattern', () => {
		const engine1 = InferenceEngine.getInstance();
		const engine2 = InferenceEngine.getInstance();
		assert.strictEqual(engine1, engine2, 'InferenceEngine should be a singleton');
	});

	test('Model configuration validation', () => {
		const configManager = ConfigManager.getInstance();
		const models = configManager.getConfig().supported_models;
		
		models.forEach(model => {
			assert.ok(model.modelname, 'Model should have a name');
			assert.ok(model.path, 'Model should have a path');
			assert.ok(model.inference_engine, 'Model should have an inference engine');
			assert.ok(typeof model.max_tokens === 'number', 'max_tokens should be a number');
			assert.ok(typeof model.temperature === 'number', 'temperature should be a number');
		});
	});

	test('Commands are registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		const bronxCommands = commands.filter(cmd => cmd.startsWith('bronx.'));
		
		assert.ok(bronxCommands.includes('bronx.openChat'), 'openChat command should be registered');
		assert.ok(bronxCommands.includes('bronx.clearChat'), 'clearChat command should be registered');
		assert.ok(bronxCommands.includes('bronx.downloadModel'), 'downloadModel command should be registered');
		assert.ok(bronxCommands.includes('bronx.manageModels'), 'manageModels command should be registered');
		assert.ok(bronxCommands.includes('bronx.openSettings'), 'openSettings command should be registered');
	});

	test('Configuration settings are available', () => {
		const config = vscode.workspace.getConfiguration('bronx');
		
		// Test that configuration properties exist (with defaults)
		assert.strictEqual(typeof config.get('localModelPath'), 'string');
		assert.strictEqual(typeof config.get('defaultModel'), 'string');
		assert.strictEqual(typeof config.get('enableCodeEditing'), 'boolean');
		assert.strictEqual(typeof config.get('autoDownloadModels'), 'boolean');
		assert.strictEqual(typeof config.get('maxTokens'), 'number');
		assert.strictEqual(typeof config.get('temperature'), 'number');
	});
});
