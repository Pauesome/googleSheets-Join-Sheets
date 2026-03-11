function rowCombinator() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Hojas de origen
  var hojas = ["Google Ads", "Meta Ads"];
  // Hoja de destino
  var combinedSheet = ss.getSheetByName("All Ads");
  if (!combinedSheet) {
    combinedSheet = ss.insertSheet("All Ads");
  }
  // Copiamos cabeceras de la primera hoja
  var headers = ss.getSheetByName("Google Ads")
    .getRange(1, 1, 1, 6).getValues()[0];
  // Limpiamos datos anteriores
  combinedSheet.clear();
  combinedSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var data = [];
  // Iteramos por cada hoja de origen
  hojas.forEach(function(hoja) {
    var sheet = ss.getSheetByName(hoja);
    if (sheet) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
        // Convertir columna 1 (Campaña) a MAYÚSCULAS
        for (var i = 0; i < values.length; i++) {
          if (values[i][0]) {
            values[i][0] = String(values[i][0]).trim().toUpperCase();
          }
        }
        data = data.concat(values);
      }
    }
  });
  // Filtra filas con valor en columna 6 (métrica clave)
  var filteredData = data.filter(function(row) {
    return row[5] !== '';
  });
  // Escribe datos combinados
  if (filteredData.length > 0) {
    combinedSheet.getRange(2, 1, filteredData.length, headers.length)
      .setValues(filteredData);
  }
  Logger.log(filteredData.length + " filas combinadas.");
}

