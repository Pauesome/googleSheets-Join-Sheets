/**
 * SheetService.gs
 *
 * All SpreadsheetApp I/O operations: reading headers and data rows,
 * creating/clearing sheets, and writing results.
 * No business logic lives here — only data access.
 */

/**
 * @typedef {Object} SheetReadResult
 * @property {string}   sheetName - Name of the sheet that was read
 * @property {any[][]}  rows      - 2D array of cell values (data rows only, no header)
 * @property {number}   rowCount  - Number of data rows found
 */

/**
 * Returns a sheet by name, or null if it does not exist.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} name
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function getSheet(ss, name) {
  return ss.getSheetByName(name);
}

/**
 * Returns a sheet by name. If the sheet does not exist it is created and appended
 * to the spreadsheet.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} name
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/**
 * Reads the header row from a sheet.
 * Clamps `columnCount` to the actual number of columns in the sheet, so a
 * sheet with fewer columns than requested will never throw a range error.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} columnCount - Desired number of columns to read
 * @param {number} headerRow   - 1-based row number of the header row
 * @returns {any[]} Flat array of header values; empty array if the sheet has no columns
 */
function readHeaders(sheet, columnCount, headerRow) {
  const lastCol = Math.min(columnCount, sheet.getLastColumn());
  if (lastCol === 0) return [];
  return sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
}

/**
 * Reads all data rows from a sheet, starting at `dataStartRow`.
 *
 * - Clamps `columnCount` to the actual number of columns present.
 * - Pads rows with empty strings when the sheet has fewer columns than requested,
 *   so the returned rows always have exactly `columnCount` entries.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} columnCount  - Number of columns to return per row
 * @param {number} dataStartRow - 1-based row number where data begins
 * @returns {any[][]} 2D array of cell values; empty array if no data rows exist
 */
function readSheetData(sheet, columnCount, dataStartRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < dataStartRow) return [];

  const rowCount = lastRow - dataStartRow + 1;
  const lastCol = Math.min(columnCount, sheet.getLastColumn());
  if (lastCol === 0) return [];

  const raw = sheet.getRange(dataStartRow, 1, rowCount, lastCol).getValues();

  // Pad each row to exactly columnCount columns when the sheet is narrower
  if (lastCol < columnCount) {
    return raw.map((row) => {
      const padded = row.slice();
      while (padded.length < columnCount) padded.push('');
      return padded;
    });
  }

  return raw;
}

/**
 * Clears all content and formatting from a sheet.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function clearSheet(sheet) {
  sheet.clear();
}

/**
 * Writes a single header row to row 1 of a sheet, starting at column 1.
 * Does nothing if `headers` is empty.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {any[]} headers - Flat array of header cell values
 */
function writeHeaders(sheet, headers) {
  if (headers.length === 0) return;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

/**
 * Writes data rows to a sheet starting at row 2, column 1.
 * Does nothing if `rows` is empty.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {any[][]} rows        - 2D array of row data
 * @param {number}  columnCount - Number of columns per row (used for range sizing)
 */
function writeData(sheet, rows, columnCount) {
  if (rows.length === 0) return;
  sheet.getRange(2, 1, rows.length, columnCount).setValues(rows);
}
