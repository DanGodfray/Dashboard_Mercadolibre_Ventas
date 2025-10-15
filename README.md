# Dashboard Demo

Esto es una demo mínima de Vite + React + TypeScript que contiene el componente Dashboard.

Requisitos previos

Node.js (incluye npm). Descárgalo e instálalo desde https://nodejs.org/
 (se recomienda la versión LTS).

Ejecución local (PowerShell)
```powershell
cd /d d:\VSCODE\REACT
npm install
npm run dev
```

Abre la URL que imprime Vite (normalmente http://localhost:5173
) para previsualizar la aplicación.

Troubleshooting
"'npm' is not recognized...": Instala Node.js y vuelve a abrir PowerShell.
- Si el puerto 5173 está en uso, Vite seleccionará otro; revisa la salida de la consola.
- Si TypeScript muestra errores por tipos faltantes, ejecuta npm install (esto instala los paquetes @types declarados en package.json).

Bugs detectados/por resolver/Issues.
- Detecta datos NaN como filtro en las ventanas del dashboard.
- El contador del KPI "Problematicas" indica un resultado mayor que lo que indica la ventana de "Distribucion de estados".
- El contador del KPI "Cobertura" indica que hay 17 regiones abarcadas (En chile solo hay 16), por lo que posiblemente esta contando valores incorrectos o nulos.
- El contador de "Distribucion de estados" no esta lineado con el KPI "Problematica" pero si con el KPI "Cancelados".
- Indica que existen clientes que no pertenecen a ninguna region o comuna, pero se deben clasificar de otra manera.

Por completar/Checklist de faltantes.
- KPI de "Clientes Frecuentes", que cuente cuantos clientes han comprado 2 veces o mas.
- En el indicador de "Clientes por region" se debe implementar un boton que filtre por comunas, al ser seleccionado que indique en que region realizar el conteo.
- Implementar un comparador de años en la ventana de "Ventas por mes", que compare y muestre en porcentaje y cantidad(unidades y monto en CLP) la diferencia.
- Implementar un indicador que muestre cuales fueron las empresas que mas han comprado, un contador de top 10 clientes frecuentes orientado a empresas (asociado a la columna `Actividad económica`).

Formato esperado del CSV/Excel
- La columna `Fecha de venta` debe estar en formato `DD-MM-YY` o `DD-MM-YYYY`.
- Las columnas relevantes referenciadas por el Dashboard son: `Estado`, `Estado.1` (region), `Comuna`, `Total (CLP)`, `SKU`, `Título de la publicación`, `Unidades`.

Alcances
- El archivo CSV o Excel admitido por el dashboard esta compuesto por la union de multiples planillas oficiales de MercadoLibre (Seller).
- El formato de cabecera (en Excel) admitido es: 
`# de venta`	`Fecha de venta`	`Estado`	`Descripción del estado`	`Paquete de varios productos`	`Unidades`	`Ingresos por productos (CLP)`	`Ingresos por envío (CLP)`	`Cargo por venta e impuestos`	`Costos de envío`	`Anulaciones y reembolsos (CLP)`	`Total (CLP)`	`Venta por publicidad`	`SKU`	`# de publicación`	`Título de la publicación`	`Variante`	`Precio unitario de venta de la publicación (CLP)`	`Tipo de publicación`	`Factura adjunta`	`Datos personales o de empresa`	`Tipo y número de documento`	`Dirección`	`Tipo de contribuyente`	`Comprador`	`Cédula de identidad`	`Domicilio`	`Comuna`	`Estado.1`	`Código postal`	`País`	`Forma de entrega`	`Fecha en camino`	`Fecha entregado`	`Transportista`	`Número de seguimiento`	`URL de seguimiento`	`Forma de entrega.1`	`Fecha en camino.1`	`Fecha entregado.1`	`Transportista.1`	`Número de seguimiento.1`	`URL de seguimiento.1`	`Reclamo abierto`	`Reclamo cerrado`	`Con mediación`	`Unidades.1`	`Unidades.2`	`Cédula`	`Mes de facturación de tus cargos`	`Actividad económica`	`Pertenece a un kit`	`Canal de venta`	`Revisado por Mercado Libre`	`Fecha de revisión`	`Dinero a favor`	`Resultado`	`Destino`	`Motivo del resultado`	`Cargo por venta e impuestos (CLP)`	`Costos de envío (CLP)	Negocio`
<img width="14280" height="21" alt="image" src="https://github.com/user-attachments/assets/227b38f4-d386-44d4-875a-d625f997941d" />
- El formato de cabecera en formato CSV es:
`# de venta;Fecha de venta;Estado;Descripción del estado;Paquete de varios productos;Unidades;Ingresos por productos (CLP);Ingresos por envío (CLP);Cargo por venta e impuestos;Costos de envío;Anulaciones y reembolsos (CLP);Total (CLP);Venta por publicidad;SKU;# de publicación;Título de la publicación;Variante;Precio unitario de venta de la publicación (CLP);Tipo de publicación;Factura adjunta;Datos personales o de empresa;Tipo y número de documento;Dirección;Tipo de contribuyente;Comprador;Cédula de identidad;Domicilio;Comuna;Estado.1;Código postal;País;Forma de entrega;Fecha en camino;Fecha entregado;Transportista;Número de seguimiento;URL de seguimiento;Forma de entrega.1;Fecha en camino.1;Fecha entregado.1;Transportista.1;Número de seguimiento.1;URL de seguimiento.1;Reclamo abierto;Reclamo cerrado;Con mediación;Unidades.1;Unidades.2;Cédula;Mes de facturación de tus cargos;Actividad económica;Pertenece a un kit;Canal de venta;Revisado por Mercado Libre;Fecha de revisión;Dinero a favor;Resultado;Destino;Motivo del resultado;Cargo por venta e impuestos (CLP);Costos de envío (CLP);Negocio	`.
- El formato podria cambiar en el futuro debido a optimizaciones en la consolidacion de planillas.
  

