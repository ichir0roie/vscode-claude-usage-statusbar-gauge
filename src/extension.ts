import * as fs from 'fs';
import * as vscode from 'vscode';

import { UsageStatusBar } from './lib/UsageStatusBar';
import { UsageStore } from './lib/UsageStore';
import { UsageViewProvider, VIEW_ID } from './lib/UsageViewProvider';

const SHOW_COMMAND = 'claudeUsage.show';

function refreshInterval(): number {
	return vscode.workspace.getConfiguration('claudeUsage').get<number>('refreshInterval', 300);
}

export function activate(context: vscode.ExtensionContext) {
	// claude はこの拡張専用のディレクトリで走らせる(ワークスペースや /tmp の設定を読ませない)
	const cwd = context.globalStorageUri.fsPath;
	fs.mkdirSync(cwd, { recursive: true, mode: 0o700 });
	const store = new UsageStore(cwd);
	const viewProvider = new UsageViewProvider(store);
	const statusBar = new UsageStatusBar(store, SHOW_COMMAND);
	context.subscriptions.push(
		store,
		viewProvider,
		vscode.window.registerWebviewViewProvider(VIEW_ID, viewProvider),
		statusBar,
	);

	const commands: Record<string, (...args: any[]) => unknown> = {
		"claudeUsage.refresh": () => vscode.window.withProgress({ location: { viewId: VIEW_ID } }, () => store.refresh()),
		[SHOW_COMMAND]: async () => {
			await vscode.commands.executeCommand(`${VIEW_ID}.focus`);
			return store.refresh();
		},
	};
	for (const [id, handler] of Object.entries(commands)) {
		context.subscriptions.push(vscode.commands.registerCommand(id, handler));
	}

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
		// ゲージの見た目だけなら、取り直さずに表示し直す
		if (e.affectsConfiguration('claudeUsage.gaugeStyle')) {
			statusBar.update();
		}
		if (e.affectsConfiguration('claudeUsage.claudePath') || e.affectsConfiguration('claudeUsage.refreshInterval')) {
			store.startTimer(refreshInterval());
			store.refresh();
		}
	}));
	store.startTimer(refreshInterval());
	store.refresh();
}

export function deactivate() { }
