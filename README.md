# Claude Usage Statusbar Gauge

Shows your Claude Code rate limits as gauges in the status bar and the sidebar, using what the `claude` CLI reports.

This is an unofficial extension. It is not made or endorsed by Anthropic.

日本語の説明は [後半](#日本語) にあります。

## Why

Claude Code on a Pro or Max plan has a session limit that resets every 5 hours and weekly limits. To see how much is left, you normally run `/usage` in Claude Code or open the Usage page on claude.ai. This extension keeps the same numbers in a corner of VS Code, so you can see them while you work and notice before you hit a limit.

## Features

- Status bar: `S ▰▰▰▰▰▱▱▱▱▱ / W ▰▰▰▰▱▱▱▱▱▱`, gauges for the current session (S, 5-hour) limit and the weekly (W) limit for all models. With `gaugeStyle` set to `none` it shows `S 46% / W 40%` instead. Hover for every limit and its reset time. Click to open the sidebar view.
- Sidebar: a "Claude Usage" view in the Activity Bar that shows every limit as a horizontal gauge in a monospace font, with the percentage and the time until reset, like the Usage panel of claude.ai. Hover a limit for the exact reset time.
- The status bar turns yellow when a limit's severity is not normal, and red when a limit reaches 100%.
- Refreshed every 5 minutes (configurable), when the view is shown, and with the refresh button in the view title.
- The command it runs does not call the model, so refreshing costs nothing and does not use up your limits.

## Requirements

- VS Code 1.90 or later.
- [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) (the `claude` command) installed and logged in with a Claude subscription (Pro or Max). Rate limits are only reported for subscription logins.

## Getting started

1. Install the extension.
2. If `claude` is not found, set `claudeUsage.claudePath` to the full path of the command (`which claude` on macOS and Linux, `where claude` on Windows).
3. The gauges appear in the status bar a few seconds after VS Code starts. Click them, or the "Claude Usage" icon in the Activity Bar, to see every limit.

## Commands

| Command | Description |
| ------- | ----------- |
| `Claude Usage: Refresh` | Fetch the rate limits again now. Also available as the refresh button in the view title. |
| `Claude Usage: Show Rate Limits` | Open the sidebar view and refresh. This is what clicking the status bar item runs. |

## Settings

| Setting | Default | Description |
| ------- | ------- | ----------- |
| `claudeUsage.claudePath` | `claude` | Path to the `claude` command. With the default value, `~/.local/bin/claude` is used when it exists, because the extension host's `PATH` often does not include it. |
| `claudeUsage.refreshInterval` | `300` | Seconds between automatic refreshes. At least 60. |
| `claudeUsage.gaugeStyle` | `parallelogram` | Characters for the status bar gauges: `parallelogram` ▰▱, `block` █░, `line` ━─, `square` ■□, `circle` ●○, `rectangle` ▮▯, or `none` to show percentages instead. |

## How it works

It runs `claude -p /usage --output-format stream-json --verbose --no-session-persistence` in the OS temp directory and reads `usage_report.rate_limits.limits` from the output.

- `/usage` is a local command of Claude Code, so no prompt is sent to the model and no tokens are used.
- `--no-session-persistence` keeps these runs out of your session history.
- It runs outside your workspace so that the project's Claude Code settings and hooks are not involved.
- The extension itself sends nothing anywhere. The only network access is what the `claude` command does to fetch your usage.

## Known limitations

- When Claude Code is logged in with an API key instead of a subscription, there are no rate limits to show.
- The yellow color for a non-normal severity has not been checked against real values such as `warning` yet.
- The output format of `claude -p /usage` is not a documented API, so a Claude Code update may break the extension.

## Related

- [ichir0roie/vscode-project-manager-deep-json](https://github.com/ichir0roie/vscode-project-manager-deep-json): this extension's project layout (TypeScript sources under `src/lib/`, build, lint and test setup) follows it.
- The sidebar view is modeled on the Usage panel in claude.ai's settings.

## Development

```sh
npm install
npm run compile   # or: npm run watch
```

Press F5 in VS Code to launch an Extension Development Host. `npm test` runs the test suite. `npm run package` builds a `.vsix`.

Issues and pull requests are welcome at [GitHub](https://github.com/ichir0roie/vscode-claude-usage-statusbar-gauge).

## License

[The Unlicense](https://unlicense.org/). This software is in the public domain, see `LICENSE.txt`.

This is an unofficial extension and is not affiliated with or endorsed by Anthropic.

---

## 日本語

`claude` コマンドが返す情報から、Claude Code の rate limit をステータスバーとサイドバーにゲージで表示する拡張機能です。

Anthropic 公式の拡張ではありません。

### 目的

Pro や Max プランで Claude Code を使うと、5 時間ごとにリセットされるセッションの枠と、週の枠がある。残りを見るには、普通は Claude Code で `/usage` を打つか、claude.ai の Usage のページを開く。この拡張は同じ数字を VS Code の隅に出しておき、作業しながら見られるようにして、枠に当たる前に気づけるようにする。

### 特徴

- ステータスバー: `S ▰▰▰▰▰▱▱▱▱▱ / W ▰▰▰▰▱▱▱▱▱▱` のように、現在のセッション枠(S、5 時間)と週の枠(W、全モデル)の使用率をゲージで出す。`gaugeStyle` を `none` にすると、代わりに `S 46% / W 40%` と出す。カーソルを乗せると全部の枠とリセット時刻が出る。クリックでサイドバーのビューを開く。
- サイドバー: アクティビティバーの「Claude Usage」ビューに、claude.ai の Usage 表示と同じ形で、全部の枠を等幅フォントの横ゲージと %、リセットまでの時間で並べる。カーソルを乗せるとリセット時刻が出る。
- severity が normal 以外になるとステータスバーが黄色に、どれかの枠が 100% になると赤になる。
- 5 分ごと(設定で変えられる)、ビューを表示したとき、タイトルの更新ボタンを押したときに取り直す。
- 実行するコマンドはモデルを呼ばないので、更新してもコストはかからず、枠も減らない。

### 必要なもの

- VS Code 1.90 以降。
- [Claude Code](https://docs.claude.com/en/docs/claude-code/overview)(`claude` コマンド)がインストールされていて、Claude のサブスクリプション(Pro か Max)でログインしていること。rate limit はサブスクリプションでログインしたときだけ返ってくる。

### 使い方

1. 拡張機能をインストールする。
2. `claude` が見つからないときは、`claudeUsage.claudePath` にコマンドのフルパスを設定する(macOS と Linux なら `which claude`、Windows なら `where claude` で分かる)。
3. VS Code が起動して数秒でステータスバーにゲージが出る。それか、アクティビティバーの「Claude Usage」アイコンをクリックすると、全部の枠が見られる。

### コマンド

| コマンド | 説明 |
| -------- | ---- |
| `Claude Usage: Refresh` | 今すぐ取り直す。ビューのタイトルの更新ボタンと同じ。 |
| `Claude Usage: Show Rate Limits` | サイドバーのビューを開いて取り直す。ステータスバーをクリックしたときに走るのはこれ。 |

### 設定

| 設定 | 既定値 | 説明 |
| ---- | ------ | ---- |
| `claudeUsage.claudePath` | `claude` | `claude` コマンドのパス。既定値のままなら、`~/.local/bin/claude` があればそれを使う(拡張ホストの `PATH` に入っていないことが多いため)。 |
| `claudeUsage.refreshInterval` | `300` | 自動更新の間隔(秒)。60 未満にはできない。 |
| `claudeUsage.gaugeStyle` | `parallelogram` | ステータスバーのゲージの文字。`parallelogram` ▰▱、`block` █░、`line` ━─、`square` ■□、`circle` ●○、`rectangle` ▮▯。`none` ならゲージを出さず % だけ。 |

### 仕組み

OS の一時ディレクトリで `claude -p /usage --output-format stream-json --verbose --no-session-persistence` を実行し、出力の `usage_report.rate_limits.limits` を読む。

- `/usage` は Claude Code のローカルコマンドなので、モデルにプロンプトは送られず、トークンも使わない。
- `--no-session-persistence` を付けているので、セッションの履歴には残らない。
- ワークスペースの外で走らせるので、プロジェクトの Claude Code の設定やフックには関わらない。
- 拡張機能そのものはどこにも何も送らない。ネットワークに出るのは、`claude` コマンドが使用状況を取りに行く分だけ。

### 制限事項

- Claude Code をサブスクリプションではなく API キーで使っているときは、rate limit が無いので何も出せない。
- severity が normal 以外(`warning` など)の実際の値で、黄色の表示をまだ確かめていない。
- `claude -p /usage` の出力形式は公開された API ではないので、Claude Code の更新で動かなくなるかもしれない。

### 関連

- [ichir0roie/vscode-project-manager-deep-json](https://github.com/ichir0roie/vscode-project-manager-deep-json): プロジェクトの構成(`src/lib/` に分けた TypeScript のソース、ビルド・lint・テストの設定)をこれに合わせた。
- サイドバーのビューは、claude.ai の設定にある Usage の表示を手本にした。

### 開発

```sh
npm install
npm run compile   # または npm run watch
```

VS Code で F5 を押すと Extension Development Host が起動する。`npm test` でテストを実行する。`npm run package` で `.vsix` を作る。

不具合の報告やプルリクエストは [GitHub](https://github.com/ichir0roie/vscode-claude-usage-statusbar-gauge) へ。

### ライセンス

[The Unlicense](https://unlicense.org/)。パブリックドメインです(`LICENSE.txt` を参照)。

Anthropic 公式の拡張機能ではなく、Anthropic とは関係ありません。
