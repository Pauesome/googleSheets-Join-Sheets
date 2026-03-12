/**
 * ValidationService.gs
 *
 * Pure validation logic — no SpreadsheetApp dependency.
 * Validates merge configs and provides default values.
 */

/**
 * @typedef {Object} MergeConfig
 * @property {string[]} sourceSheets         - Ordered list of source tab names; headers are taken from index 0
 * @property {string}   destinationSheet     - Tab name to write merged rows into
 * @property {number}   columnCount          - Number of columns to read from each source (1-based count)
 * @property {number}   normalizeColumnIndex - 0-based column index whose values will be normalized
 * @property {number}   requiredMetricColumnIndex - 0-based column index; rows blank here are filtered out
 * @property {boolean}  uppercaseNormalize   - Convert normalize column values to uppercase
 * @property {boolean}  trimValues           - Trim whitespace from normalize column values
 * @property {boolean}  clearDestination     - Clear the destination sheet before writing
 * @property {number}   dataStartRow         - 1-based row number where data begins in source sheets
 * @property {number}   headerRow            - 1-based row number of the header row in source sheets
 */

/**
 * Default configuration values applied by `applyConfigDefaults`.
 * @type {MergeConfig}
 */
const DEFAULT_CONFIG = {
  sourceSheets: [],
  destinationSheet: 'All Ads',
  columnCount: 6,
  normalizeColumnIndex: 0,
  requiredMetricColumnIndex: 5,
  uppercaseNormalize: true,
  trimValues: true,
  clearDestination: true,
  dataStartRow: 2,
  headerRow: 1,
};

/**
 * Returns a new config object with all missing fields filled from DEFAULT_CONFIG.
 *
 * @param {Partial<MergeConfig>} partial - Partial config provided by the caller
 * @returns {MergeConfig} Fully-populated config object
 */
function applyConfigDefaults(partial) {
  return Object.assign({}, DEFAULT_CONFIG, partial);
}

/**
 * Validates every field of a MergeConfig and throws a descriptive Error on
 * the first invalid value found. Call this after `applyConfigDefaults`.
 *
 * @param {MergeConfig} config - The config to validate
 * @throws {Error} If any field fails validation
 */
function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be a non-null object.');
  }

  // ── sourceSheets ────────────────────────────────────────────────────────────
  if (!Array.isArray(config.sourceSheets) || config.sourceSheets.length === 0) {
    throw new Error('sourceSheets must be a non-empty array of sheet names.');
  }
  config.sourceSheets.forEach((name, i) => {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error(`sourceSheets[${i}] must be a non-empty string.`);
    }
  });

  // ── destinationSheet ────────────────────────────────────────────────────────
  if (typeof config.destinationSheet !== 'string' || config.destinationSheet.trim() === '') {
    throw new Error('destinationSheet must be a non-empty string.');
  }
  if (config.sourceSheets.includes(config.destinationSheet)) {
    throw new Error(
      `destinationSheet "${config.destinationSheet}" cannot also be listed as a source sheet.`
    );
  }

  // ── columnCount ─────────────────────────────────────────────────────────────
  if (
    !Number.isInteger(config.columnCount) ||
    config.columnCount < 1 ||
    config.columnCount > 50
  ) {
    throw new Error('columnCount must be an integer between 1 and 50.');
  }

  // ── normalizeColumnIndex ────────────────────────────────────────────────────
  if (
    !Number.isInteger(config.normalizeColumnIndex) ||
    config.normalizeColumnIndex < 0 ||
    config.normalizeColumnIndex >= config.columnCount
  ) {
    throw new Error(
      `normalizeColumnIndex must be an integer between 0 and ${config.columnCount - 1} ` +
        `(got ${config.normalizeColumnIndex}).`
    );
  }

  // ── requiredMetricColumnIndex ───────────────────────────────────────────────
  if (
    !Number.isInteger(config.requiredMetricColumnIndex) ||
    config.requiredMetricColumnIndex < 0 ||
    config.requiredMetricColumnIndex >= config.columnCount
  ) {
    throw new Error(
      `requiredMetricColumnIndex must be an integer between 0 and ${config.columnCount - 1} ` +
        `(got ${config.requiredMetricColumnIndex}).`
    );
  }

  // ── boolean flags ───────────────────────────────────────────────────────────
  ['uppercaseNormalize', 'trimValues', 'clearDestination'].forEach((field) => {
    if (typeof config[field] !== 'boolean') {
      throw new Error(`"${field}" must be a boolean (true or false).`);
    }
  });

  // ── row indices ─────────────────────────────────────────────────────────────
  if (!Number.isInteger(config.headerRow) || config.headerRow < 1) {
    throw new Error('headerRow must be a positive integer (got ' + config.headerRow + ').');
  }
  if (!Number.isInteger(config.dataStartRow) || config.dataStartRow < 1) {
    throw new Error('dataStartRow must be a positive integer (got ' + config.dataStartRow + ').');
  }
  if (config.dataStartRow <= config.headerRow) {
    throw new Error(
      `dataStartRow (${config.dataStartRow}) must be greater than headerRow (${config.headerRow}).`
    );
  }
}
