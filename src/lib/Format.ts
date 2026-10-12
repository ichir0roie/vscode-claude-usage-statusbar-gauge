// 表示用の整形。vscode に依存しない。
import { RateLimit } from './Collect';

export type Level = 'normal' | 'warning' | 'error';

// ステータスバーに出す枠と、そこでの短い名前
const SHORT_LABELS: Record<string, string> = { session: 'S', weekly_all: 'W' };

function pad(n: number): string {
	return String(n).padStart(2, '0');
}

export function formatDateTime(d: Date): string {
	return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDuration(ms: number): string {
	if (ms <= 0) {
		return 'now';
	}
	const minutes = Math.floor(ms / 60000);
	const days = Math.floor(minutes / 1440);
	const hours = Math.floor((minutes % 1440) / 60);
	if (days > 0) {
		return `${days}d ${hours}h`;
	}
	return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

// 「in 2h 50m (10/13 00:50)」
export function formatReset(iso: string | null, now = new Date()): string {
	if (!iso) {
		return '';
	}
	const at = new Date(iso);
	return `in ${formatDuration(at.getTime() - now.getTime())} (${formatDateTime(at)})`;
}

// 「in 2h」。一番大きい単位だけ
export function formatResetShort(iso: string, now = new Date()): string {
	const ms = new Date(iso).getTime() - now.getTime();
	return ms <= 0 ? 'now' : `in ${formatDuration(ms).split(' ')[0]}`;
}

export function limitLabel(limit: RateLimit): string {
	switch (limit.kind) {
		case 'session':
			return 'Session (5hr)';
		case 'weekly_all':
			return 'Weekly (7 day)';
		case 'weekly_scoped':
			return `${limit.scope?.model?.display_name ?? 'Model'} limit`;
		default:
			return limit.kind;
	}
}

export function limitLevel(limit: RateLimit): Level {
	if (limit.percent >= 100) {
		return 'error';
	}
	return limit.severity === 'normal' ? 'normal' : 'warning';
}

export function worstLevel(limits: RateLimit[]): Level {
	const levels = limits.map(limitLevel);
	return levels.includes('error') ? 'error' : levels.includes('warning') ? 'warning' : 'normal';
}

// ステータスバーは文字しか出せないので、埋まった分と空きの分の 2 文字でゲージを描く。
// キーは設定 claudeUsage.gaugeStyle の値
export const GAUGE_STYLES: Record<string, [string, string]> = {
	parallelogram: ['▰', '▱'],
	block: ['█', '░'],
	line: ['━', '─'],
	square: ['■', '□'],
	circle: ['●', '○'],
	rectangle: ['▮', '▯'],
};
export const DEFAULT_GAUGE_STYLE = 'parallelogram';

// style が none や未知の値なら空文字
export function gauge(percent: number, style = DEFAULT_GAUGE_STYLE, width = 10): string {
	const chars = GAUGE_STYLES[style];
	if (!chars) {
		return '';
	}
	const filled = Math.round(Math.min(Math.max(percent, 0), 100) / 100 * width);
	return chars[0].repeat(filled) + chars[1].repeat(width - filled);
}

// 「S ▰▰▰▰▰▱▱▱▱▱ / W ▰▰▰▰▱▱▱▱▱▱」。ゲージを出さない設定のときだけ「S 46% / W 40%」
export function statusText(limits: RateLimit[], style = DEFAULT_GAUGE_STYLE): string {
	const parts = limits.filter(l => SHORT_LABELS[l.kind])
		.map(l => `${SHORT_LABELS[l.kind]} ${gauge(l.percent, style) || `${l.percent}%`}`);
	return parts.length ? parts.join(' / ') : '--';
}

// claude の出力をそのまま Markdown に入れないよう、記号を文字として出す
export function escapeMarkdown(s: string): string {
	return s.replace(/[\\`*_{}[\]()#+\-.!|<>$~]/g, '\\$&');
}

export function limitsMarkdown(limits: RateLimit[], now = new Date()): string {
	if (!limits.length) {
		return 'No rate limits reported.';
	}
	return [
		'| | used | resets |',
		'| --- | ---: | --- |',
		...limits.map(l => `| ${escapeMarkdown(limitLabel(l))} | ${escapeMarkdown(String(l.percent))}% | ${formatReset(l.resets_at, now)} |`),
	].join('\n');
}
