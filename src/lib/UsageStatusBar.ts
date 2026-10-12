import * as vscode from 'vscode';

import { DEFAULT_GAUGE_STYLE, formatDateTime, Level, limitsMarkdown, statusText, worstLevel } from './Format';
import { UsageStore } from './UsageStore';

const BACKGROUNDS: Record<Level, vscode.ThemeColor | undefined> = {
	normal: undefined,
	warning: new vscode.ThemeColor('statusBarItem.warningBackground'),
	error: new vscode.ThemeColor('statusBarItem.errorBackground'),
};

// 下のステータスバーに「S ▰▰▰▰▰▱▱▱▱▱ / W ▰▰▰▰▱▱▱▱▱▱」を出す。クリックでサイドバーのビューを開く
export class UsageStatusBar implements vscode.Disposable {
	private readonly item = vscode.window.createStatusBarItem('claudeUsage.status', vscode.StatusBarAlignment.Right, 100);
	private readonly subscription: vscode.Disposable;

	constructor(private readonly store: UsageStore, command: string) {
		this.item.name = 'Claude Usage';
		this.item.command = command;
		this.subscription = store.onDidChange(() => this.update());
		this.update();
		this.item.show();
	}

	update() {
		const { limits, error, updatedAt } = this.store.state;
		if (!updatedAt && !error) {
			this.item.text = '$(loading~spin) Claude';
			this.item.tooltip = 'Claude Usage: loading...';
			return;
		}
		const style = vscode.workspace.getConfiguration('claudeUsage').get<string>('gaugeStyle', DEFAULT_GAUGE_STYLE);
		this.item.text = `$(${error ? 'warning' : 'pulse'}) ${statusText(limits, style)}`;
		this.item.backgroundColor = BACKGROUNDS[worstLevel(limits)];
		const md = new vscode.MarkdownString(limitsMarkdown(limits));
		if (error) {
			// エラーは claude の stderr なので、Markdown として解釈させない
			md.appendMarkdown('\n\n$(error) ');
			md.appendText(error);
		}
		if (updatedAt) {
			md.appendMarkdown(`\n\nupdated ${formatDateTime(updatedAt)}`);
		}
		md.supportThemeIcons = true;
		this.item.tooltip = md;
	}

	dispose() {
		this.subscription.dispose();
		this.item.dispose();
	}
}
