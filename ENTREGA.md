# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `fintech` · **Integrantes:** HombreAmarilloPv, 777-erick · **Repositorio:** https://github.com/HombreAmarilloPv/equipo-fintech-automatizacion

> Respondan aquí, en este archivo, y háganle commit. Sean breves y concretos: una frase buena vale más que un párrafo.

## 1. ¿Qué automatizamos y por qué? (decisión)

| Criterio (US-xx · CAy) | ¿Automatizamos? | Por qué (frecuencia · riesgo · estabilidad · facilidad de verificar) |
|---|---|---|
| US-04 · CA2 (7 mochilas, stock 6, avisa) | Sí | Agregar al carrito es el primer paso de toda compra (frecuencia alta). Riesgo alto: sobreventa. El `alert()` es determinista y su texto se verifica fácil. |
| US-04 · CA3 (4 + 4 mochilas supera el stock) | Sí | Mismo riesgo de sobreventa, pero por una ruta que a mano casi nadie prueba. Es estable y la máquina compara cantidad y aviso sin error. |
| US-05 · CA2 (“+” respeta el stock) | Sí | Otra vía para superar el stock. Se repite en cada compra, es estable y verificable (cantidad final y aviso). |
| US-06 · CA2 (“−” con cantidad 1) | Sí | Caso límite que a mano se olvida; es determinista y se verifica contando líneas del carrito. |
| US-07 · CA2 (quitar el único producto) | Sí | Flujo muy frecuente, riesgo medio, resultado simple de comprobar (carrito vacío y subtotal `$ 0`). |
| US-09 · CA1 y CA3 (DESC10 y sus variantes) | Sí | Cálculo de dinero (riesgo alto). Con datos en tabla, el reporte dice qué variante falla y una máquina las repite sin cansarse. |
| US-10 · CA2 (código inválido no borra el descuento) | Sí | Combina estado y dinero; a mano es fácil pasarlo por alto. Estable y comparable (total antes y después). |
| US-11 · CA2 y US-12 · CA2 (IVA y total con descuento) | Sí | Riesgo muy alto (dinero). La máquina calcula el valor esperado con un oráculo independiente de la tienda, mejor que una calculadora a mano. |
| US-13 · CA3 (no pagar con total cero) | Sí | Evita un cobro inválido (riesgo alto). Se verifica con un estado del botón (`disabled`), muy estable. |
| US-15 · CA1–CA4 (correos válidos y mal formados) | Sí | Muchas combinaciones de datos: ideal para automatizar y muy tedioso a mano. Resultado claro (aceptado o mensaje). |
| US-16 · CA1 (formulario vacío en la compra siguiente) | Sí | Riesgo de privacidad. Pasos largos y repetitivos a mano; verificación simple (`toHaveValue("")`). |
| US-17 · CA3 (número de pedido tras recargar) | Sí | Riesgo alto (pedidos duplicados). Exige comprar dos veces con recarga en medio: costoso a mano, trivial para una máquina. |
| US-20 · accesibilidad (lector de pantalla, contraste) | No / Más adelante | Pide juicio humano; una herramienta automática solo detecta una parte. Se puede sumar axe como complemento, no como reemplazo. |

## 2. Bugs que nuestra suite detecta

| Prueba (archivo › título) | Bug en Jira (clave) | ¿Quedó con `test.fail(...)`? | Evidencia (captura o trace) |
|---|---|---|---|
| 02-carrito › US-04 CA3: 4 + 4 mochilas supera el stock | LBH-45 | Sí | Reporte HTML (anotación + error). Adjuntar captura en Jira. |
| 02-carrito › US-05 CA2: “+” no pasa del stock | LBH-46 | Sí | Reporte HTML. Adjuntar captura en Jira. |
| 02-carrito › US-06 CA2: con cantidad 1, “−” elimina el producto | LBH-47 | Sí | Reporte HTML. Adjuntar captura en Jira. |
| 03-descuentos-iva › US-09 CA3: `desc10` y `Desc10` | LBH-51 | Sí (solo esas 2 filas) | Reporte HTML. Adjuntar captura en Jira. |
| 03-descuentos-iva › US-10 CA2: código inválido no borra el descuento | LBH-52 | Sí | Reporte HTML. Adjuntar captura en Jira. |
| 03-descuentos-iva › US-11 CA2: IVA sobre el valor descontado | LBH-53 | Sí | Reporte HTML. Adjuntar captura en Jira. |
| 03-descuentos-iva › US-12 CA2: total con descuento | LBH-66 | Sí | Reporte HTML. Adjuntar captura en Jira. |
| 04-checkout › US-13 CA3: total cero no permite pagar | LBH-54 | Sí | Reporte HTML. Adjuntar captura en Jira. |
| 04-checkout › US-15: `ana.gomez@`, `ana-gomez@`, `ana+tienda@` | LBH-57 | Sí (solo esas 3 filas) | Reporte HTML. Adjuntar captura en Jira. |
| 04-checkout › US-15: `ana@universidad.edu.co` | LBH-58 | Sí (solo esa fila) | Reporte HTML. Adjuntar captura en Jira. |
| 05-confirmacion › US-16 CA1: formulario vacío en la compra siguiente | LBH-60 | Sí | `test-results/05-confirmacion-US-16-…/error-context.md` |
| 05-confirmacion › US-17 CA3: número de pedido tras recargar | LBH-61 | Sí | `test-results/05-confirmacion-US-17-…/error-context.md`: `Expected: not "Número de pedido: #1001"`, `Received: "Número de pedido: #1001"` |

**Pregunta de los datos (US-09 CA3 y US-15):** en US-09 CA3 fallaron 2 de 3 filas (`desc10`, `Desc10`) y tienen en común que no están en mayúsculas: es **un** bug (LBH-51). En US-15 fallaron 4 de 6 correos válidos: tres tienen punto, guion o `+` antes de la arroba y uno tiene un dominio con varios puntos. Son **dos** bugs distintos (LBH-57 y LBH-58).

**Pregunta de US-12:** LBH-53 (IVA) y LBH-66 (total) tienen la misma causa probable (la tienda calcula el IVA sobre el subtotal sin descuento), pero se reportan por separado porque lo que ve el usuario es distinto: la fila IVA y la fila Total. Conviene dejar en Jira que están relacionados.

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto (producto / prueba / inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el catálogo tiene 6 productos | **Prueba** (el título estaba desactualizado) | El criterio US-01 CA1 y nuestra prueba `01-catalogo` dicen 8 productos; los contamos a mano en la tienda y son 8. La aserción ya espera 8, lo que estaba mal era el título. | Renombrarla a “el catálogo tiene 8 productos”. No es un bug del producto. |
| H2 · el IVA de 2 mochilas con DESC20 es $ 19.760 | **Prueba** (el oráculo se tomó de la tienda) **y de paso destapa un bug del producto** | Cálculo a mano: 2 × $ 65.000 = $ 130.000; DESC20 = $ 26.000; base $ 104.000; IVA 19 % = **$ 19.760** (es lo que dice el título). La aserción esperaba **$ 24.700**, que es el 19 % de $ 130.000, o sea el IVA sin descuento. Es el mismo defecto de LBH-53. | Corregir el valor esperado a `$ 19.760` y marcarla con `test.fail(true, 'LBH-53 · IVA calculado sin descontar')`. |
| H3 · agregar un cuaderno justo después de cargar | **Inestable** | Usa `waitUntil: 'domcontentloaded'` y hace clic de inmediato en el primer “Agregar”: a veces la página aún no está lista para recibir el clic. `--repeat-each=10` da resultados mezclados: __ de 10 fallan (completar con su medición). | Quitar la dependencia del instante: esperar una condición (página lista) en vez de una pausa fija, y ubicar la tarjeta de “Cuaderno universitario” en vez de `.first()`. Verificar con `--repeat-each=30`: __ de 30 en verde. |

## 4. Medidas

Completen los espacios con sus números reales (no estimados al vuelo).

- Casos de prueba de nuestro plan en Jira: **\_\_** · automatizados en este laboratorio: **\_\_** (**\_\_ %**). Referencia: la suite tiene 34 pruebas ejecutables (contando cada fila de datos como una), que cubren 20 criterios distintos.
- Tiempo que nos tomó escribir las pruebas automatizadas: **\_\_ min** (lo pueden ver en las horas de sus commits) · tiempo de ejecutar toda la suite: **\_\_ s** (lo da `npx playwright test` en la última línea).
- Tiempo estimado de ejecutar **a mano** esos mismos casos: **\_\_ min**
- Con esos números, ¿en cuántas ejecuciones se paga la automatización? (inversión ÷ ahorro por ejecución): **\_\_**

  Cuenta: inversión = minutos que tomó escribir las pruebas; ahorro por ejecución = minutos a mano − segundos de la suite (pasados a minutos).

## 5. Reflexión (máximo 5 líneas cada una)

1. **¿Qué casos de nuestro plan no automatizaríamos y por qué?** La accesibilidad (US-20) y la claridad de los mensajes: una máquina comprueba que haya un texto, pero no si una persona lo entiende o si un lector de pantalla lo anuncia bien. Tampoco automatizaríamos algo que se prueba una sola vez o que cambia cada semana.
2. **Si la tienda cambia el HTML de un botón, ¿qué parte se rompe y cuál no?** Se corrige en un solo lugar, `pages/TiendaPage.ts`, y las pruebas que usan `agregar`, `aplicarCodigo`, `irAPagar` o `confirmar` siguen intactas. Pero varias pruebas todavía usan localizadores directos (los mensajes de error de `04-checkout`, el campo “Nombre completo” de `05-confirmacion`), y esas sí habría que corregir una por una.
3. **Una prueba roja nuestra que no era un bug del producto:** H2. Esperaba `$ 24.700`, pero al calcular a mano el IVA sobre lo descontado da `$ 19.760`: la prueba había copiado el resultado de la tienda en lugar del criterio. Nos dimos cuenta al comparar el título, el cálculo a mano y la aserción.
4. **¿Qué bug o riesgo no habría encontrado la automatización por sí sola?** Los de accesibilidad y usabilidad (contraste, orden de tabulación, mensajes confusos), y cualquier cálculo donde la prueba use el mismo error que la aplicación. Por eso el oráculo del IVA y del total sale del criterio y no de lo que muestra la tienda.
5. **¿Qué haríamos distinto en un proyecto real?** Pondríamos todos los localizadores en el Page Object desde el principio, usaríamos identificadores de prueba (`data-testid`) acordados con desarrollo y revisaríamos cada `test.fail` para confirmar que falla por el bug y no por un error de la propia prueba. Además dejaríamos el comentario con el nombre de la prueba en cada issue de Jira apenas se escribe.