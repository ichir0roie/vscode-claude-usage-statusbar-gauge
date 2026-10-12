// claude コマンドから rate limit を取る。vscode に依存しない。
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface RateLimit {
	kind: string;
	group: string;
	percent: number;
	resets_at: string | null;
	scope: { model?: { display_name?: string } | null; surface?: unknown } | null;
	severity: string;
	is_active: boolean;
}

// /usage はローカルコマンドなのでモデルは呼ばない(total_cost_usd は 0)。
// -p では信頼の確認が出ないまま、カレントディレクトリの .claude/settings.json のフックまで走るので、ユーザの設定だけを読ませる
const USAGE_ARGS = ['-p', '/usage', '--output-format', 'stream-json', '--verbose', '--no-session-persistence',
	'--setting-sources', 'user'];

// 拡張ホストの PATH には ~/.local/bin が入っていないことがあるので、既定値のときはそこも見る
export function resolveClaude(configured: string | undefined): string {
	if (configured && configured !== 'claude') {
		return configured;
	}
	const local = path.join(os.homedir(), '.local', 'bin', 'claude');
	return fs.existsSync(local) ? local : 'claude';
}

// stream-json の assistant メッセージの usage_report.rate_limits.limits に、rate limit が JSON で入っている
export function parseRateLimits(stdout: string): RateLimit[] {
	for (const line of stdout.split('\n')) {
		let msg: any;
		try {
			msg = JSON.parse(line);
		} catch {
			continue;
		}
		if (msg.type === 'assistant' && msg.usage_report) {
			return msg.usage_report.rate_limits?.limits ?? [];
		}
	}
	throw new Error('usage_report not found in /usage output');
}

// cwd は自分しか書き込めないディレクトリにする。/tmp のような共有の場所だと、他のユーザが置いた設定を読みかねない
export async function fetchRateLimits(cwd: string, claudePath?: string): Promise<RateLimit[]> {
	let stdout: string;
	try {
		({ stdout } = await execFileAsync(resolveClaude(claudePath), USAGE_ARGS,
			{ cwd, timeout: 30000, maxBuffer: 10 * 1024 * 1024 }));
	} catch (e) {
		const err = e as { stderr?: string; message: string };
		throw new Error((err.stderr || err.message).trim().split('\n')[0]);
	}
	return parseRateLimits(stdout);
}
