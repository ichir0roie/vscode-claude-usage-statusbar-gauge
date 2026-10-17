# Change Log

## 0.0.2 (2026-10-17)

### Changed

- The weekly gauge in the status bar has 7 cells, one per day.
- The icons are a single row of three gauge cells.

### Security

- `claude` runs in the extension's own storage directory with `--setting-sources user`, instead of the OS temp directory, so project settings and hooks from the workspace or a shared directory are not loaded.
- `claudeUsage.claudePath` is only read from user settings, so a workspace cannot change which program runs.
- Text from the `claude` output is escaped in the status bar tooltip and the sidebar view.

## 0.0.1 (2026-10-12)

### Added

- Status bar item with gauges for the session and weekly rate limits. It turns yellow or red as the limits get close. The gauge characters can be changed with `claudeUsage.gaugeStyle`.
- "Claude Usage" view in the Activity Bar that shows every rate limit as a horizontal gauge with the time until reset.
- Automatic refresh (`claudeUsage.refreshInterval`), and a refresh button in the view title.
- `claudeUsage.claudePath` setting.
