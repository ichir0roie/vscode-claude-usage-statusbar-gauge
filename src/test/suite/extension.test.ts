import * as assert from 'assert';
import * as vscode from 'vscode';

import { parseRateLimits, RateLimit } from '../../lib/Collect';
import { formatDuration, formatResetShort, gauge, limitsMarkdown, statusText, worstLevel } from '../../lib/Format';
import { renderUsageHtml } from '../../lib/UsageHtml';

function limit(kind: string, percent: number, severity = 'normal'): RateLimit {
	return {
		kind, group: kind === 'session' ? 'session' : 'weekly', percent, resets_at: '2026-10-12T15:50:00+00:00',
		scope: kind === 'weekly_scoped' ? { model: { display_name: 'Fable' }, surface: null } : null,
		severity, is_active: kind === 'session',
	};
}

const LIMITS = [limit('session', 39), limit('weekly_all', 41), limit('weekly_scoped', 0)];

const USAGE_STREAM = [
	JSON.stringify({ type: 'system', subtype: 'init' }),
	JSON.stringify({ type: 'assistant', usage_report: { rate_limits: { limits: LIMITS, extra_usage: null } } }),
	JSON.stringify({ type: 'result', subtype: 'success', result: 'Current session: 39% used' }),
].join('\n');

suite('Extension Test Suite', () => {
	test('extension activates and registers commands', async () => {
		const ext = vscode.extensions.getExtension('ichir0roie.claude-usage-statusbar-gauge');
		assert.ok(ext);
		await ext.activate();
		const commands = await vscode.commands.getCommands(true);
		for (const id of ['refresh', 'show']) {
			assert.ok(commands.includes(`claudeUsage.${id}`), id);
		}
	});

	test('parseRateLimits reads usage_report from stream-json', () => {
		assert.deepStrictEqual(parseRateLimits(USAGE_STREAM), LIMITS);
		assert.throws(() => parseRateLimits('{"type":"result","result":""}'));
	});

	test('statusText shows the session and weekly limits', () => {
		assert.strictEqual(statusText(LIMITS), 'S ▰▰▰▰▱▱▱▱▱▱ / W ▰▰▰▰▱▱▱▱▱▱');
		assert.strictEqual(statusText(LIMITS, 'none'), 'S 39% / W 41%');
		assert.strictEqual(statusText([]), '--');
	});

	test('worstLevel', () => {
		assert.strictEqual(worstLevel(LIMITS), 'normal');
		assert.strictEqual(worstLevel([...LIMITS, limit('weekly_all', 85, 'warning')]), 'warning');
		assert.strictEqual(worstLevel([limit('session', 100)]), 'error');
	});

	test('format helpers', () => {
		assert.strictEqual(gauge(0), '▱▱▱▱▱▱▱▱▱▱');
		assert.strictEqual(gauge(44), '▰▰▰▰▱▱▱▱▱▱');
		assert.strictEqual(gauge(150), '▰▰▰▰▰▰▰▰▰▰');
		assert.strictEqual(gauge(44, 'line'), '━━━━──────');
		assert.strictEqual(gauge(46), '▰▰▰▰▰▱▱▱▱▱');
		assert.strictEqual(gauge(44, 'none'), '');
		const now = new Date('2026-10-12T13:25:00+00:00');
		assert.strictEqual(formatResetShort('2026-10-12T15:50:00+00:00', now), 'in 2h');
		assert.strictEqual(formatResetShort('2026-10-16T06:00:00+00:00', now), 'in 3d');
		assert.strictEqual(formatResetShort('2026-10-12T13:00:00+00:00', now), 'now');
		assert.strictEqual(formatDuration((2 * 60 + 50) * 60000), '2h 50m');
		assert.strictEqual(formatDuration((3 * 24 + 5) * 3600000), '3d 5h');
		assert.strictEqual(formatDuration(-1), 'now');
		assert.ok(limitsMarkdown(LIMITS).includes('| Fable limit | 0% |'));
	});

	test('renderUsageHtml draws a gauge per limit', () => {
		const html = renderUsageHtml({ limits: LIMITS, updatedAt: new Date() });
		for (const label of ['Session (5hr)', 'Weekly (7 day)', 'Fable limit']) {
			assert.ok(html.includes(`<span class="label">${label}</span>`), label);
		}
		assert.ok(html.includes('style="width: 41%"'));
		assert.ok(renderUsageHtml({ limits: [] }).includes('Loading...'));
		const failed = renderUsageHtml({ limits: LIMITS.slice(0, 1), error: '<timeout>' });
		assert.ok(failed.includes('Session (5hr)') && failed.includes('&lt;timeout&gt;'));
	});
});
