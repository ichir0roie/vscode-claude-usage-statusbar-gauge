import * as vscode from 'vscode';

import { renderUsageHtml } from './UsageHtml';
import { UsageStore } from './UsageStore';

export const VIEW_ID = 'claudeUsage.view';

// サイドバーのビュー。スクリプトは使わず、値が変わるたびに HTML を丸ごと差し替える
export class UsageViewProvider implements vscode.WebviewViewProvider, vscode.Disposable {
	private view?: vscode.WebviewView;
	private readonly subscription: vscode.Disposable;

	constructor(private readonly store: UsageStore) {
		this.subscription = store.onDidChange(() => this.render());
	}

	resolveWebviewView(view: vscode.WebviewView) {
		this.view = view;
		view.webview.options = { enableScripts: false };
		view.onDidChangeVisibility(() => {
			if (view.visible) {
				this.store.refresh();
			}
		});
		view.onDidDispose(() => {
			this.view = undefined;
		});
		this.render();
	}

	private render() {
		if (this.view) {
			this.view.webview.html = renderUsageHtml(this.store.state);
		}
	}

	dispose() {
		this.subscription.dispose();
	}
}
