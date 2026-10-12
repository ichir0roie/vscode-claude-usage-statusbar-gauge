// サイドバーの webview に出す HTML。claude.ai の Usage 表示に合わせた、等幅フォントの横ゲージ。vscode に依存しない。
import { formatResetShort, limitLabel, limitLevel } from './Format';
import { UsageState } from './UsageStore';

function escapeHtml(s: string): string {
	const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	return s.replace(/[&<>"']/g, c => map[c]);
}

const STYLE = `
	body {
		margin: 0;
		padding: 4px 20px 12px 20px;
		font-family: var(--vscode-editor-font-family), monospace;
		font-size: var(--vscode-editor-font-size);
		color: var(--vscode-foreground);
		background: transparent;
	}
	.limit { margin-bottom: 14px; }
	.head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
	.label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.track {
		height: 5px;
		border-radius: 3px;
		background: color-mix(in srgb, var(--vscode-foreground) 15%, transparent);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: 3px;
		background: color-mix(in srgb, var(--vscode-foreground) 55%, transparent);
	}
	.warning .fill { background: var(--vscode-editorWarning-foreground); }
	.error .fill { background: var(--vscode-errorForeground); }
	.reset, .note { margin-top: 6px; font-size: 0.85em; color: var(--vscode-descriptionForeground); }
	.message { color: var(--vscode-errorForeground); font-size: 0.85em; word-break: break-word; }
`;

export function renderUsageHtml(state: UsageState, now = new Date()): string {
	const rows = state.limits.map(l => {
		const width = Math.min(Math.max(l.percent, 0), 100);
		const resetsAt = l.resets_at ? new Date(l.resets_at).toLocaleString() : '';
		const reset = l.resets_at ? `Resets ${formatResetShort(l.resets_at, now)}` : '';
		return `<div class="limit ${limitLevel(l)}" title="${escapeHtml(resetsAt)}">
	<div class="head"><span class="label">${escapeHtml(limitLabel(l))}</span><span>${escapeHtml(String(l.percent))}%</span></div>
	<div class="track"><div class="fill" style="width: ${width}%"></div></div>
	<div class="reset">${escapeHtml(reset)}</div>
</div>`;
	});
	if (state.error) {
		rows.push(`<div class="message">${escapeHtml(state.error)}</div>`);
	} else if (!state.updatedAt) {
		rows.push('<div class="note">Loading...</div>');
	} else if (!state.limits.length) {
		rows.push('<div class="note">No rate limits reported.</div>');
	}
	return `<!doctype html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<style>${STYLE}</style></head>
<body>
${rows.join('\n')}
</body></html>`;
}
