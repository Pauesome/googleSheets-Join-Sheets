function combinarFilas() {
  var hojas = ["Insert sheet name", "Insert sheet name 2", "Insert sheet name 3"];
  var headers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Insert headers sheet name").getRange(1, 1, 1, 7).getValues()[0];
  var combinedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Insert JOIN sheet name");
  if (!combinedSheet) {
      combinedSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Insert JOIN sheet name");
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
