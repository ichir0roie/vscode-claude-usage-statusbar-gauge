import * as vscode from 'vscode';

import { fetchRateLimits, RateLimit } from './Collect';

export interface UsageState {
	limits: RateLimit[];
	// 取得に失敗したときのメッセージ。limits は前回取れた値のまま残す
	error?: string;
	updatedAt?: Date;
}

// 最新の rate limit を持ち、サイドバーとステータスバーに変更を知らせる
export class UsageStore implements vscode.Disposable {
	private readonly changed = new vscode.EventEmitter<void>();
	readonly onDidChange = this.changed.event;
	state: UsageState = { limits: [] };
	private pending?: Promise<void>;
	private timer?: ReturnType<typeof setInterval>;

	// cwd は claude を走らせるディレクトリ
	constructor(private readonly cwd: string) { }

	// 取得中に何度呼ばれても、コマンドは 1 回分だけ走らせる
	refresh(): Promise<void> {
		this.pending ??= this.load().finally(() => {
			this.pending = undefined;
		});
		return this.pending;
	}

	private async load() {
		const claudePath = vscode.workspace.getConfiguration('claudeUsage').get<string>('claudePath');
		try {
			this.state = { limits: await fetchRateLimits(this.cwd, claudePath), updatedAt: new Date() };
		} catch (e) {
			this.state = { ...this.state, error: (e as Error).message };
		}
		this.changed.fire();
	}

	startTimer(seconds: number) {
		clearInterval(this.timer);
		this.timer = setInterval(() => this.refresh(), Math.max(seconds, 60) * 1000);
	}

	dispose() {
		clearInterval(this.timer);
		this.changed.dispose();
	}
}
