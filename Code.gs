/**
 * Code.gs
 *
 * Entry point for the Ads Merge Google Sheets add-on.
 * Registers the custom menu and provides thin wrappers that wire the UI
 * to ConfigService and MergeService. No business logic lives here.
 *
 * Dependencies (other .gs files in the same project):
 *   - ConfigService.gs  → loadConfig(), saveConfig(), resetConfig()
 *   - MergeService.gs   → runMerge(config)
 *   - Sidebar.html      → sidebar markup
 */

// ── Lifecycle hooks ───────────────────────────────────────────────────────────

/**
 * Runs automatically when the spreadsheet is opened.
 * Adds the "Ads Merge" menu to the Extensions menu bar.
 *
 * @param {GoogleAppsScript.Events.SheetsOnOpen} e
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('Ads Merge')
    .addItem('Open Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('Preview Merge', 'previewMerge')
    .addItem('Run Last Merge', 'runLastMerge')
    .addSeparator()
    .addItem('Reset Saved Config', 'resetSavedConfig')
    .addToUi();
}

/**
 * Required for add-ons installed from the Workspace Marketplace.
 * Mirrors onOpen so the menu is added after installation without a reload.
 *
 * @param {GoogleAppsScript.Events.AddonOnInstall} e
 */
function onInstall(e) {
  onOpen(e);
}

// ── Menu actions ──────────────────────────────────────────────────────────────

/**
 * Opens the Ads Merge sidebar, pre-populated with the last saved config.
 * The sidebar handles both configuration editing and triggering merge runs.
 */
function showSidebar() {
  const sidebar = HtmlService
    .createHtmlOutputFromFile('Sidebar')
    .setTitle('Ads Merge');
  SpreadsheetApp.getUi().showSidebar(sidebar);
}

/**
 * Loads the last saved config and runs the merge pipeline without clearing
 * the destination sheet first, so the user can inspect results non-destructively.
 * Shows a summary dialog on success; shows an error alert on failure.
 */
function previewMerge() {
  const ui = SpreadsheetApp.getUi();
  let config;

  try {
    config = loadConfig();
  } catch (err) {
    ui.alert('Ads Merge — Config Error', err.message, ui.ButtonSet.OK);
    return;
  }

  // Force preview mode: append rather than overwrite the destination
  const previewConfig = Object.assign({}, config, { clearDestination: false });

  try {
    const result = runMerge(previewConfig);
    showResultDialog_(result, /* isPreview= */ true);
  } catch (err) {
    ui.alert('Ads Merge — Preview Error', err.message, ui.ButtonSet.OK);
  }
}

/**
 * Loads the last saved config and runs a full (destructive) merge.
 * Shows a toast on success. Surfaces warnings and errors as alert dialogs.
 */
function runLastMerge() {
  const ui = SpreadsheetApp.getUi();
  let config;

  try {
    config = loadConfig();
  } catch (err) {
    ui.alert('Ads Merge — Config Error', err.message, ui.ButtonSet.OK);
    return;
  }

  try {
    const result = runMerge(config);

    const toast =
      `Written: ${result.rowsWritten} rows  |  ` +
      `Read: ${result.rowsRead}  |  ` +
      `Filtered out: ${result.rowsFilteredOut}`;
    SpreadsheetApp.getActive().toast(toast, 'Ads Merge — Done ✓', 6);

    if (result.warnings.length > 0) {
      ui.alert('Ads Merge — Warnings', result.warnings.join('\n'), ui.ButtonSet.OK);
    }
  } catch (err) {
    ui.alert('Ads Merge — Error', err.message, ui.ButtonSet.OK);
  }
}

/**
 * Prompts for confirmation, then clears all saved settings from document
 * properties. The next merge will use DEFAULT_CONFIG values from ValidationService.
 */
function resetSavedConfig() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Ads Merge — Reset Config',
    'This will permanently delete your saved settings.\nAre you sure?',
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  resetConfig();
  ui.alert('Ads Merge', 'Settings have been reset to defaults.', ui.ButtonSet.OK);
}

// ── Server functions exposed to the sidebar via google.script.run ─────────────

/**
 * Returns the names of all sheets in the active spreadsheet.
 * Called by the sidebar on load to populate source / destination dropdowns.
 *
 * @returns {string[]}
 */
function getSheetNames() {
  return SpreadsheetApp.getActiveSpreadsheet()
    .getSheets()
    .map((sheet) => sheet.getName());
}

/**
 * Saves the submitted config and immediately runs the merge.
 * Called by the sidebar "Run" button so config is always persisted before execution.
 *
 * @param {Partial<MergeConfig>} config - Config object submitted from the sidebar form
 * @returns {MergeResult}
 */
function runMergeFromSidebar(config) {
  saveConfig(config);
  return runMerge(config);
}

// ── Private UI helpers ────────────────────────────────────────────────────────

/**
 * Builds and displays a modal dialog containing the merge result summary,
 * a per-source row breakdown, any warnings, and a preview of the first written rows.
 *
 * @param {MergeResult} result
 * @param {boolean}     [isPreview=false] - Adds "(Preview)" to the dialog title
 */
function showResultDialog_(result, isPreview) {
  const title = isPreview ? 'Ads Merge — Preview Result' : 'Ads Merge — Result';

  const breakdownRows = Object.entries(result.sourceBreakdown)
    .map(([name, count]) => `<tr><td>${name}</td><td>${count}</td></tr>`)
    .join('');

  const warningHtml = result.warnings.length > 0
    ? `<div class="warn"><strong>Warnings</strong><br>${result.warnings.map((w) => `• ${w}`).join('<br>')}</div>`
    : '';

  const headerCells = result.headers.map((h) => `<th>${h}</th>`).join('');
  const previewRowsHtml = result.previewSample.length > 0
    ? result.previewSample
        .map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`)
        .join('')
    : `<tr><td colspan="${result.headers.length || 1}" class="empty">No rows to preview</td></tr>`;

  const html = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body  { font-family: Arial, sans-serif; font-size: 13px; padding: 14px; margin: 0; }
      h3    { margin: 0 0 10px; font-size: 14px; }
      .stat { margin: 3px 0; }
      table { border-collapse: collapse; width: 100%; margin-top: 6px; font-size: 12px; }
      th, td { border: 1px solid #d1d5db; padding: 4px 8px; text-align: left; }
      th    { background: #f3f4f6; font-weight: 600; }
      .empty { color: #9ca3af; }
      .warn { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px;
              padding: 8px 10px; margin-top: 10px; color: #92400e; font-size: 12px; }
      details { margin-top: 10px; }
      summary { cursor: pointer; color: #4b5563; font-size: 12px; }
      .scroll { overflow-x: auto; margin-top: 8px; }
    </style>
  </head>
  <body>
    <p class="stat"><strong>Rows read:</strong> ${result.rowsRead}</p>
    <p class="stat"><strong>Rows filtered out:</strong> ${result.rowsFilteredOut}</p>
    <p class="stat"><strong>Rows written:</strong> ${result.rowsWritten}</p>

    <details>
      <summary>Source breakdown</summary>
      <table style="margin-top:6px;width:auto">
        <tr><th>Sheet</th><th>Rows read</th></tr>
        ${breakdownRows}
      </table>
    </details>

    ${warningHtml}

    <p style="margin-top:12px;margin-bottom:4px">
      <strong>Preview</strong>
      <span style="color:#6b7280;font-size:11px">(first ${result.previewSample.length} rows)</span>
    </p>
    <div class="scroll">
      <table>
        <tr>${headerCells}</tr>
        ${previewRowsHtml}
      </table>
    </div>
  </body>
</html>`;

  const output = HtmlService.createHtmlOutput(html).setWidth(540).setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(output, title);
}
