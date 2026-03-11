# combinarFilas.gs — Google Apps Script

Unifica datos de Google Ads y Meta Ads en una sola hoja de Google Sheets.  
*Consolidates Google Ads and Meta Ads data into a single Google Sheets tab.*

---

## 🇪🇸 Español

### Qué hace

Este script lee los datos de las hojas **Google Ads** y **Meta Ads** dentro de tu Google Sheet, normaliza los nombres de campaña a mayúsculas y escribe todo en una hoja unificada llamada **All Ads**. Cada ejecución limpia los datos anteriores y reescribe desde cero, sin duplicados.

### Requisitos previos

Antes de ejecutar el script necesitas tener los datos de ambas plataformas ya en tu Google Sheet. Puedes hacerlo con:

- **Dataslayer** (recomendado): conector gratuito que extrae datos directamente desde las APIs de Google Ads y Meta Ads.
- **Google Ads Reports**: add-on nativo de Google para exportar datos a Sheets.
- **Exportación manual**: exporta los CSVs desde cada plataforma e impórtalos manualmente.

### Estructura de columnas

El script lee las columnas **por posición**, no por nombre. Ambas hojas deben tener exactamente el mismo orden. Ejemplo recomendado:

| Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 |
|-------|-------|-------|-------|-------|-------|
| Campaña | Fecha | Impresiones | Clics | Coste | Source |

> ⚠️ La columna **Source** no la exporta ninguna plataforma de forma nativa. Añádela manualmente como columna fija: valor `GOOGLE` en la hoja de Google Ads y `FACEBOOK` en la hoja de Meta Ads. El script la usa como filtro de calidad y descarta cualquier fila donde esté vacía.

### Cómo usarlo

**Paso 1 — Prepara tu Google Sheet**

Asegúrate de tener dos hojas con datos: una llamada `Google Ads` y otra `Meta Ads` (o los nombres que prefieras, ajustándolos en el código). Las columnas deben estar en el mismo orden en ambas hojas. Añade la columna Source al final de cada una.

**Paso 2 — Abre el editor de Apps Script**

En tu Google Sheet, ve a `Extensiones → Apps Script`. Se abrirá el editor en una nueva pestaña.

**Paso 3 — Pega el script**

Borra el contenido por defecto del editor, pega el código de `combinarFilas.gs` y guarda con `Ctrl+S` / `Cmd+S`.

**Paso 4 — Ejecuta**

Haz clic en el botón **Ejecutar** (▶). La primera vez Google te pedirá que autorices el script para acceder a tu hoja. Acepta los permisos. En unos segundos aparecerá la pestaña **All Ads** con todos los datos combinados.

**Paso 5 (opcional) — Automatizar la ejecución**

Para que el script se ejecute automáticamente (por ejemplo, cada mañana):

1. En el editor de Apps Script, haz clic en el icono del reloj → **Activadores**.
2. Haz clic en **Añadir activador**.
3. Selecciona la función `combinarFilas`, tipo **Basado en tiempo** y la frecuencia deseada.
4. Guarda. El script se ejecutará automáticamente a partir de ese momento.

---

## 🇬🇧 English

### What it does

This script reads data from the **Google Ads** and **Meta Ads** tabs in your Google Sheet, normalizes all campaign names to uppercase, and writes everything into a unified tab called **All Ads**. Each run clears previous data and rewrites from scratch — no duplicates.

### Prerequisites

Before running the script, you need the data from both platforms already loaded into your Google Sheet. You can do this with:

- **Dataslayer** (recommended): a free connector that pulls data directly from the Google Ads and Meta Ads APIs.
- **Google Ads Reports**: Google's native add-on to export campaign data to Sheets.
- **Manual export**: export CSVs from each platform and import them manually.

### Column structure

The script reads columns **by position**, not by name. Both sheets must have exactly the same column order. Recommended structure:

| Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 |
|-------|-------|-------|-------|-------|-------|
| Campaign | Date | Impressions | Clicks | Cost | Source |

> ⚠️ The **Source** column is not exported natively by either platform. Add it manually as a fixed column: value `GOOGLE` in the Google Ads sheet and `FACEBOOK` in the Meta Ads sheet. The script uses it as a quality filter and discards any row where it's empty.

### How to use it

**Step 1 — Prepare your Google Sheet**

Make sure you have two sheets with data: one named `Google Ads` and one named `Meta Ads` (or any names you prefer, as long as you update them in the code). Columns must be in the same order in both sheets. Add the Source column at the end of each.

**Step 2 — Open the Apps Script editor**

In your Google Sheet, go to `Extensions → Apps Script`. The editor will open in a new tab.

**Step 3 — Paste the script**

Clear the default content in the editor, paste the `combinarFilas.gs` code, and save with `Ctrl+S` / `Cmd+S`.

**Step 4 — Run it**

Click the **Run** button (▶). The first time, Google will ask you to authorize the script to access your spreadsheet. Accept the permissions. Within a few seconds, an **All Ads** tab will appear with all the combined data.

**Step 5 (optional) — Automate execution**

To run the script automatically (e.g., every morning):

1. In the Apps Script editor, click the clock icon → **Triggers**.
2. Click **Add Trigger**.
3. Select the `combinarFilas` function, trigger type **Time-driven**, and your desired frequency.
4. Save. The script will run automatically from that point on.

---

*Script by [ferrerponseti.com](https://ferrerponseti.com) — Paid Media & Growth Consulting*
