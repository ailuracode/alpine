const AQ_DEVTOOLS_LIGHT_THEME = `
  --aq-background: hsl(0 0% 100%);
  --aq-foreground: hsl(240 10% 3.9%);
  --aq-card: hsl(0 0% 100%);
  --aq-card-foreground: hsl(240 10% 3.9%);
  --aq-muted: hsl(240 4.8% 95.9%);
  --aq-muted-foreground: hsl(240 3.8% 46.1%);
  --aq-border: hsl(240 5.9% 90%);
  --aq-input: hsl(240 5.9% 90%);
  --aq-ring: hsl(240 5.9% 10%);
  --aq-primary: hsl(240 5.9% 10%);
  --aq-primary-foreground: hsl(0 0% 98%);
  --aq-secondary: hsl(240 4.8% 95.9%);
  --aq-secondary-foreground: hsl(240 5.9% 10%);
  --aq-accent: hsl(240 4.8% 95.9%);
  --aq-accent-foreground: hsl(240 5.9% 10%);
  --aq-destructive: hsl(0 84.2% 60.2%);
  --aq-destructive-foreground: hsl(0 0% 98%);
  --aq-success: hsl(142 76% 36%);
  --aq-success-foreground: hsl(0 0% 98%);
  --aq-warning: hsl(38 92% 50%);
  --aq-warning-foreground: hsl(240 5.9% 10%);
  --aq-warning-text: hsl(32 95% 38%);
  --aq-pending: hsl(262 83% 58%);
  --aq-pending-foreground: hsl(0 0% 98%);
  --aq-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --aq-shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --aq-tab-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  color-scheme: light;
`;

const AQ_DEVTOOLS_DARK_THEME = `
  --aq-background: hsl(240 10% 3.9%);
  --aq-foreground: hsl(0 0% 98%);
  --aq-card: hsl(240 10% 3.9%);
  --aq-card-foreground: hsl(0 0% 98%);
  --aq-muted: hsl(240 3.7% 15.9%);
  --aq-muted-foreground: hsl(240 5% 64.9%);
  --aq-border: hsl(240 3.7% 15.9%);
  --aq-input: hsl(240 3.7% 15.9%);
  --aq-ring: hsl(240 4.9% 83.9%);
  --aq-primary: hsl(0 0% 98%);
  --aq-primary-foreground: hsl(240 5.9% 10%);
  --aq-secondary: hsl(240 3.7% 15.9%);
  --aq-secondary-foreground: hsl(0 0% 98%);
  --aq-accent: hsl(240 3.7% 15.9%);
  --aq-accent-foreground: hsl(0 0% 98%);
  --aq-destructive: hsl(0 62.8% 30.6%);
  --aq-destructive-foreground: hsl(0 0% 98%);
  --aq-success: hsl(142 71% 45%);
  --aq-success-foreground: hsl(0 0% 98%);
  --aq-warning: hsl(38 92% 50%);
  --aq-warning-foreground: hsl(240 5.9% 10%);
  --aq-warning-text: hsl(38 92% 62%);
  --aq-pending: hsl(263 70% 72%);
  --aq-pending-foreground: hsl(240 5.9% 10%);
  --aq-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.45), 0 4px 6px -4px rgb(0 0 0 / 0.35);
  --aq-shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.55), 0 8px 10px -6px rgb(0 0 0 / 0.45);
  --aq-tab-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
  color-scheme: dark;
`;

export const DEVTOOLS_STYLES = `
.aq-devtools-root {
  ${AQ_DEVTOOLS_LIGHT_THEME}
  --aq-radius: 0.5rem;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-feature-settings: "rlig" 1, "calt" 1;
  color: var(--aq-foreground);
  z-index: 2147483646;
  -webkit-font-smoothing: antialiased;
}

:root[data-theme="dark"] .aq-devtools-root,
:root.dark .aq-devtools-root,
.aq-devtools-root.aq-devtools-root--dark {
  ${AQ_DEVTOOLS_DARK_THEME}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .aq-devtools-root:not(.aq-devtools-root--light) {
    ${AQ_DEVTOOLS_DARK_THEME}
  }
}

.aq-devtools-root.aq-devtools-root--light {
  ${AQ_DEVTOOLS_LIGHT_THEME}
}

.aq-devtools-toggle {
  position: fixed;
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: 2.25rem;
  padding: 0 1rem;
  border: 1px solid var(--aq-border);
  background: var(--aq-background);
  color: var(--aq-foreground);
  border-radius: calc(var(--aq-radius) - 2px);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--aq-shadow);
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.aq-devtools-toggle--top-left {
  top: 1rem;
  left: 1rem;
}

.aq-devtools-toggle--top-right {
  top: 1rem;
  right: 1rem;
}

.aq-devtools-toggle--bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.aq-devtools-toggle--bottom-right {
  right: 1rem;
  bottom: 1rem;
}

.aq-devtools-toggle:hover {
  background: var(--aq-accent);
  color: var(--aq-accent-foreground);
}

.aq-devtools-toggle:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--aq-background), 0 0 0 4px var(--aq-ring);
}

.aq-devtools-panel {
  position: fixed;
  display: none;
  flex-direction: column;
  overflow: hidden;
  background: var(--aq-background);
  border: 1px solid var(--aq-border);
  color: var(--aq-card-foreground);
  box-shadow: var(--aq-shadow-lg);
}

.aq-devtools-panel.is-open {
  display: flex;
}

.aq-devtools-panel--bottom {
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.75rem;
  height: min(440px, 58vh);
  border-radius: var(--aq-radius);
}

.aq-devtools-panel--right {
  top: 0.75rem;
  right: 0.75rem;
  bottom: 0.75rem;
  width: min(480px, calc(100vw - 1.5rem));
  border-radius: var(--aq-radius);
}

.aq-devtools-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--aq-border);
  background: var(--aq-background);
}

.aq-devtools-title {
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  letter-spacing: -0.01em;
  color: var(--aq-foreground);
}

.aq-devtools-search {
  flex: 1;
  min-width: 0;
  height: 2.25rem;
  border: 1px solid var(--aq-input);
  background: var(--aq-background);
  color: var(--aq-foreground);
  border-radius: calc(var(--aq-radius) - 2px);
  padding: 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.aq-devtools-search::placeholder {
  color: var(--aq-muted-foreground);
}

.aq-devtools-search:focus {
  outline: none;
  border-color: var(--aq-ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--aq-ring) 20%, transparent);
}

.aq-devtools-select {
  height: 2.25rem;
  border: 1px solid var(--aq-input);
  background: var(--aq-background);
  color: var(--aq-foreground);
  border-radius: calc(var(--aq-radius) - 2px);
  padding: 0 0.625rem;
  font-size: 0.8125rem;
  cursor: pointer;
}

.aq-devtools-select:focus {
  outline: none;
  border-color: var(--aq-ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--aq-ring) 20%, transparent);
}

.aq-devtools-tabs {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.125rem;
  border-radius: calc(var(--aq-radius) - 2px);
  background: var(--aq-muted);
}

.aq-devtools-tab,
.aq-devtools-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--aq-muted-foreground);
  border-radius: calc(var(--aq-radius) - 4px);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.aq-devtools-tab:hover,
.aq-devtools-btn:hover {
  color: var(--aq-foreground);
}

.aq-devtools-tab.is-active {
  background: var(--aq-background);
  color: var(--aq-foreground);
  box-shadow: var(--aq-tab-shadow);
}

.aq-devtools-btn {
  border-color: var(--aq-border);
  background: var(--aq-background);
  color: var(--aq-foreground);
}

.aq-devtools-btn:hover {
  background: var(--aq-accent);
  color: var(--aq-accent-foreground);
}

.aq-devtools-btn:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--aq-background), 0 0 0 4px var(--aq-ring);
}

.aq-devtools-btn--primary {
  border-color: transparent;
  background: var(--aq-primary);
  color: var(--aq-primary-foreground);
}

.aq-devtools-btn--primary:hover {
  opacity: 0.92;
  color: var(--aq-primary-foreground);
}

.aq-devtools-btn--destructive {
  border-color: transparent;
  background: var(--aq-destructive);
  color: var(--aq-destructive-foreground);
}

.aq-devtools-btn--destructive:hover {
  opacity: 0.92;
  color: var(--aq-destructive-foreground);
}

.aq-devtools-btn--ghost {
  border-color: transparent;
  background: transparent;
  color: var(--aq-muted-foreground);
}

.aq-devtools-btn--ghost:hover {
  background: var(--aq-accent);
  color: var(--aq-accent-foreground);
}

.aq-devtools-body {
  display: grid;
  grid-template-columns: minmax(240px, 36%) 1fr;
  min-height: 0;
  flex: 1;
  background: var(--aq-muted);
}

.aq-devtools-panel--right .aq-devtools-body {
  grid-template-columns: 1fr;
  grid-template-rows: minmax(180px, 38%) 1fr;
}

.aq-devtools-list,
.aq-devtools-detail {
  overflow: auto;
  min-height: 0;
}

.aq-devtools-list {
  border-right: 1px solid var(--aq-border);
  background: var(--aq-background);
}

.aq-devtools-item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  border-bottom: 1px solid var(--aq-border);
  background: transparent;
  color: inherit;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.aq-devtools-item:hover {
  background: var(--aq-accent);
}

.aq-devtools-item.is-selected {
  background: var(--aq-muted);
  box-shadow: inset 3px 0 0 0 var(--aq-primary);
}

.aq-devtools-item-key {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-word;
  color: var(--aq-foreground);
}

.aq-devtools-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.aq-devtools-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid var(--aq-border);
  padding: 0.125rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.01em;
  background: var(--aq-background);
  color: var(--aq-foreground);
}

.aq-devtools-badge--success {
  border-color: color-mix(in srgb, var(--aq-success) 35%, var(--aq-border));
  background: color-mix(in srgb, var(--aq-success) 12%, var(--aq-background));
  color: var(--aq-success);
}

.aq-devtools-badge--error {
  border-color: color-mix(in srgb, var(--aq-destructive) 35%, var(--aq-border));
  background: color-mix(in srgb, var(--aq-destructive) 10%, var(--aq-background));
  color: var(--aq-destructive);
}

.aq-devtools-badge--pending {
  border-color: color-mix(in srgb, var(--aq-pending) 35%, var(--aq-border));
  background: color-mix(in srgb, var(--aq-pending) 10%, var(--aq-background));
  color: var(--aq-pending);
}

.aq-devtools-badge--fetching,
.aq-devtools-badge--stale {
  border-color: color-mix(in srgb, var(--aq-warning) 35%, var(--aq-border));
  background: color-mix(in srgb, var(--aq-warning) 12%, var(--aq-background));
  color: var(--aq-warning-text);
}

.aq-devtools-badge--muted {
  background: var(--aq-secondary);
  color: var(--aq-muted-foreground);
}

.aq-devtools-detail {
  padding: 1rem 1.125rem;
  background: var(--aq-background);
}

.aq-devtools-section {
  margin-bottom: 1.25rem;
}

.aq-devtools-section:last-child {
  margin-bottom: 0;
}

.aq-devtools-section h3 {
  margin: 0 0 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--aq-muted-foreground);
}

.aq-devtools-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.aq-devtools-pre {
  margin: 0;
  padding: 0.875rem 1rem;
  border-radius: calc(var(--aq-radius) - 2px);
  background: var(--aq-muted);
  border: 1px solid var(--aq-border);
  font-size: 0.75rem;
  line-height: 1.6;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--aq-foreground);
}

.aq-devtools-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 6rem;
  padding: 1.5rem 1rem;
  color: var(--aq-muted-foreground);
  font-size: 0.875rem;
  text-align: center;
}
`;
