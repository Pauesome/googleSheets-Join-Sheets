/**
 * MergeService.gs
 *
 * Orchestrates the full merge flow and contains all pure transformation logic.
 * Depends on ValidationService.gs (validateConfig, applyConfigDefaults)
 * and SheetService.gs (getSheet, getOrCreateSheet, readHeaders, readSheetData,
 * clearSheet, writeHeaders, writeData).
 */

/**
 * @typedef {Object} MergeResult
 * @property {any[]}                  headers         - Header values copied from the first source sheet
 * @property {number}                 rowsRead        - Total data rows read across all source sheets
 * @property {number}                 rowsFilteredOut - Rows dropped because required metric column was blank
 * @property {number}                 rowsWritten     - Rows written to the destination sheet
 * @property {Object.<string,number>} sourceBreakdown - Per-sheet row counts, e.g. { "Google Ads": 120 }
 * @property {any[][]}                previewSample   - First few written rows (for sidebar preview)
 * @property {string[]}               warnings        - Non-fatal issues (e.g. a source sheet not found)
 */

/** Maximum number of rows included in previewSample. */
const PREVIEW_SAMPLE_SIZE = 5;

// ── Orchestrator ──────────────────────────────────────────────────────────────

/**
 * Runs the full merge pipeline:
 *   1. Apply defaults & validate config
 *   2. Read headers from the first source sheet
 *   3. Read & concatenate data rows from all source sheets
 *   4. Normalize the selected column (trim / uppercase)
 *   5. Filter out rows where the required metric column is blank
 *   6. Write headers + filtered rows to the destination sheet
 *   7. Return a MergeResult summary
 *
 * Throws on hard failures (invalid config, first source sheet missing).
 * Non-fatal issues (a secondary source sheet not found) are collected in
 * `MergeResult.warnings` so the caller can surface them without aborting.
 *
 * @param {Partial<MergeConfig>} rawConfig - Config provided by the caller; defaults are applied internally
 * @returns {MergeResult}
 * @throws {Error} On validation failure or when the first source sheet cannot be found
 */
function runMerge(rawConfig) {
  const config = applyConfigDefaults(rawConfig);
  validateConfig(config);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const warnings = [];

  // ── 1. Headers — must come from the first source sheet ────────────────────
  const firstSourceName = config.sourceSheets[0];
  const firstSourceSheet = getSheet(ss, firstSourceName);
  if (!firstSourceSheet) {
    throw new Error(
      `Header source sheet "${firstSourceName}" was not found. ` +
        'Please verify the sheet name matches exactly (including capitalisation).'
    );
  }
  const headers = readHeaders(firstSourceSheet, config.columnCount, config.headerRow);

  // ── 2. Read rows from every source sheet ──────────────────────────────────
  let allRows = [];
  const sourceBreakdown = {};

  for (const sheetName of config.sourceSheets) {
    const sheet = getSheet(ss, sheetName);
    if (!sheet) {
      warnings.push(`Source sheet "${sheetName}" was not found and has been skipped.`);
      sourceBreakdown[sheetName] = 0;
      continue;
    }

    const rows = readSheetData(sheet, config.columnCount, config.dataStartRow);
    sourceBreakdown[sheetName] = rows.length;
    allRows = allRows.concat(rows);
  }

  const rowsRead = allRows.length;

  // ── 3. Normalize the selected column ──────────────────────────────────────
  const normalized = normalizeColumn(
    allRows,
    config.normalizeColumnIndex,
    config.uppercaseNormalize,
    config.trimValues
  );

  // ── 4. Filter rows where the required metric column is blank ──────────────
  const filtered = filterByRequiredMetric(normalized, config.requiredMetricColumnIndex);
  const rowsFilteredOut = rowsRead - filtered.length;

  // ── 5. Write to destination ───────────────────────────────────────────────
  const destSheet = getOrCreateSheet(ss, config.destinationSheet);

  if (config.clearDestination) {
    clearSheet(destSheet);
  }

  writeHeaders(destSheet, headers);
  writeData(destSheet, filtered, config.columnCount);

  const rowsWritten = filtered.length;

  if (rowsWritten === 0) {
    warnings.push(
      'All rows were filtered out — only the header row was written to the destination sheet.'
    );
  }

  Logger.log(
    `[MergeService] Done. Read: ${rowsRead} | Filtered out: ${rowsFilteredOut} | Written: ${rowsWritten}`
  );

  return {
    headers,
    rowsRead,
    rowsFilteredOut,
    rowsWritten,
    sourceBreakdown,
    previewSample: buildPreviewSample(filtered, PREVIEW_SAMPLE_SIZE),
    warnings,
  };
}

// ── Pure transformation helpers ───────────────────────────────────────────────
// These functions have no SpreadsheetApp dependency and can be unit-tested
// independently by calling them directly in the Apps Script editor.

/**
 * Returns a new 2D array with the value at `colIndex` normalized in every row.
 * Normalization is controlled by the `uppercase` and `trim` flags.
 * Non-string values (numbers, Dates) are coerced via String() before transformation.
 * Null / undefined cells are left unchanged.
 *
 * Does NOT mutate the input array.
 *
 * @param {any[][]}  rows      - Source 2D array
 * @param {number}   colIndex  - 0-based column index to normalize
 * @param {boolean}  uppercase - Convert value to uppercase when true
 * @param {boolean}  trim      - Trim leading/trailing whitespace when true
 * @returns {any[][]} New 2D array with the specified column normalized
 */
function normalizeColumn(rows, colIndex, uppercase, trim) {
  return rows.map((row) => {
    const copy = row.slice();
    const cell = copy[colIndex];

    if (cell === null || cell === undefined) return copy;

    let val = String(cell);
    if (trim) val = val.trim();
    if (uppercase) val = val.toUpperCase();
    copy[colIndex] = val;

    return copy;
  });
}

/**
 * Returns only rows where the value at `colIndex` is considered non-blank.
 *
 * Blank is defined as:
 *   - null or undefined
 *   - an empty string or a string containing only whitespace
 *
 * Numbers, Dates, and booleans are always treated as non-blank.
 *
 * @param {any[][]} rows     - Source 2D array
 * @param {number}  colIndex - 0-based column index of the required metric
 * @returns {any[][]} Filtered rows
 */
function filterByRequiredMetric(rows, colIndex) {
  return rows.filter((row) => {
    const val = row[colIndex];
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim() !== '';
    return true; // numbers, Dates, booleans are non-blank
  });
}

/**
 * Returns the first `maxRows` rows from `rows` for use as a preview sample.
 *
 * @param {any[][]} rows    - Full result array
 * @param {number}  maxRows - Maximum number of rows to return
 * @returns {any[][]}
 */
function buildPreviewSample(rows, maxRows) {
  return rows.slice(0, maxRows);
}
