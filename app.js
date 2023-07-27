function combinarFilas() {
  var hojas = ["RAW TY UA", "RAW TY GA4"];
  var headers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RAW TY UA").getRange(1, 1, 1, 7).getValues()[0];
  var combinedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RAW TY Merged (Definitivo)");
  if (!combinedSheet) {
      combinedSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("RAW TY Merged (Definitivo)");
  }
  combinedSheet.getRange(1, 1, 1, 7).setValues([headers]);
  var data = [];
  for (var i = 0; i < hojas.length; i++) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(hojas[i]);
      var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
      data = data.concat(values);
  }
  var filteredData = data.filter(function (row) {
      return row[5] !== '';
  });
  combinedSheet.getRange(2, 1, filteredData.length, 7).setValues(filteredData);
}