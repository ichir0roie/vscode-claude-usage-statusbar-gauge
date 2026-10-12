# Claude Usage

Shows your Claude Code rate limits in the status bar and the sidebar, using what the `claude` CLI reports.

日本語の説明は [後半](#日本語) にあります。

## Features

- Status bar: `S ▰▰▰▰▰▱▱▱▱▱ / W ▰▰▰▰▱▱▱▱▱▱`, gauges for the current session (S, 5-hour) limit and the weekly (W) limit for all models. With `gaugeStyle` set to `none` it shows `S 46% / W 40%` instead. Hover for every limit and its reset time. Click to open the sidebar view.
- Sidebar: a "Claude Usage" view in the Activity Bar that shows every limit as a horizontal gauge in a monospace font, with the percentage and the time until reset, like the Usage panel of claude.ai. Hover a limit for the exact reset time.
- The status bar turns yellow when a limit's severity is not normal, and red when a limit reaches 100%.
- Refreshed every 5 minutes (configurable), when the view is shown, and with the refresh button in the view title.
- The command it runs does not call the model, so refreshing costs nothing.

## How it works

It runs `claude -p /usage --output-format stream-json --verbose --no-session-persistence` in the OS temp directory and reads `usage_report.rate_limits.limits` from the output.

## Settings

| Setting | Default | Description |
| ------- | ------- | ----------- |
| `claudeUsage.claudePath` | `claude` | Path to the `claude` command. With the default value, `~/.local/bin/claude` is used when it exists, because the extension host's `PATH` often does not include it. |
| `claudeUsage.refreshInterval` | `300` | Seconds between automatic refreshes. At least 60. |
| `claudeUsage.gaugeStyle` | `parallelogram` | Characters for the status bar gauges: `parallelogram` ▰▱, `block` █░, `line` ━─, `square` ■□, `circle` ●○, `rectangle` ▮▯, or `none` to show percentages instead. |

## Development

```sh
npm install
npm run compile   # or: npm run watch
```

Press F5 in VS Code to launch an Extension Development Host. `npm test` runs the test suite.

## License

MIT.

---

## 日本語

`claude` コマンドが返す情報から、Claude Code の rate limit をステータスバーとサイドバーに表示する拡張機能です。

### 特徴

- ステータスバー: `S ▰▰▰▰▰▱▱▱▱▱ / W ▰▰▰▰▱▱▱▱▱▱` のように、現在のセッション枠(S、5 時間)と週の枠(W、全モデル)の使用率をゲージで出す。`gaugeStyle` を `none` にすると、代わりに `S 46% / W 40%` と出す。カーソルを乗せると全部の枠とリセット時刻が出る。クリックでサイドバーのビューを開く。
- サイドバー: アクティビティバーの「Claude Usage」ビューに、claude.ai の Usage 表示と同じ形で、全部の枠を等幅フォントの横ゲージと %、リセットまでの時間で並べる。カーソルを乗せるとリセット時刻が出る。
- severity が normal 以外になるとステータスバーが黄色に、どれかの枠が 100% になると赤になる。
- 5 分ごと(設定で変えられる)、ビューを表示したとき、タイトルの更新ボタンを押したときに取り直す。
- 実行するコマンドはモデルを呼ばないので、更新してもコストはかからない。

### 仕組み

OS の一時ディレクトリで `claude -p /usage --output-format stream-json --verbose --no-session-persistence` を実行し、出力の `usage_report.rate_limits.limits` を読む。

### 設定

| 設定 | 既定値 | 説明 |
| ---- | ------ | ---- |
| `claudeUsage.claudePath` | `claude` | `claude` コマンドのパス。既定値のままなら、`~/.local/bin/claude` があればそれを使う(拡張ホストの `PATH` に入っていないことが多いため)。 |
| `claudeUsage.refreshInterval` | `300` | 自動更新の間隔(秒)。60 未満にはできない。 |
| `claudeUsage.gaugeStyle` | `parallelogram` | ステータスバーのゲージの文字。`parallelogram` ▰▱、`block` █░、`line` ━─、`square` ■□、`circle` ●○、`rectangle` ▮▯。`none` ならゲージを出さず % だけ。 |

### 開発

```sh
npm install
npm run compile   # または npm run watch
```

VS Code で F5 を押すと Extension Development Host が起動する。`npm test` でテストを実行する。
