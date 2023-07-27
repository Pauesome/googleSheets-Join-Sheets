# Script para combinar hojas en Google Sheets

El script que encontrarás en este repositorio tiene como objetivo juntar el número de hojas que quieras dentro de un Google Sheets. A continuación se describen los detalles para utilizar el script:

## Instrucciones

1. **Fila 2**: Las hojas que quieras combinar separadas por comas (,) y entre comillas (').
2. **Fila 3**: La hoja de la quieres sacar los headers (nombres de dimensiones y métricas).
3. **Fila 4**: Debes indicar la hoja en la que quieres volcar toda la información.
4. **Fila 5**: En caso de que la hoja donde combinar los datos no exista, el script la crea.
5. El último número de los `get.range` indica el número de columnas que quieres procesar con la fórmula (si tienes 7 columnas sumando métricas y dimensiones, se pone un 7).

## Uso del script

1. Abre tu Google Sheets.
2. Accede a la hoja de cálculo donde deseas realizar la combinación de hojas.
3. Haz clic en "Herramientas" en la barra de navegación y selecciona "Editor de secuencia de comandos".
4. Selecciona "Nuevo" para crear un nuevo script.
5. Copia y pega el contenido del script en el editor.
6. Guarda el script y cierra el editor.
7. Ejecuta el script haciendo clic en el botón de "play" ▶️.
8. ¡El script combinará las hojas siguiendo las indicaciones de la Fila 2, 3 y 4!

## Nota

Asegúrate de haber configurado correctamente el entorno de Google Sheets y de tener los permisos necesarios para ejecutar secuencias de comandos en tu hoja de cálculo.

¡Espero que este script te sea útil! Si tienes alguna pregunta o problema, no dudes en abrir un problema o contactarme.
