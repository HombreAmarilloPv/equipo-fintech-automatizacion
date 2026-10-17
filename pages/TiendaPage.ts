import { type Locator, type Page } from '@playwright/test';

/**
 * PARTE 5 · PAGE OBJECT DE LA TIENDA.
 *
 * Idea: las pruebas deben contar la HISTORIA ("agrego una mochila y aplico DESC10"), no el HTML
 * (".rounded-lg", "dt:text-is(...) + dd"). Los localizadores (el "cómo") viven aquí, en un solo lugar.
 * Si mañana la tienda cambia su HTML, se corrige esta clase una vez y las pruebas siguen intactas.
 *
 * Qué hacer:
 *  1. Implementen los métodos que sus pruebas ya repiten (reemplacen cada `throw new Error('TODO')`).
 *     Muevan hacia aquí el código que escribieron en las Partes 2 a 4. No hace falta completarlos todos: con
 *     8 o más basta, empiecen por los que más se repiten.
 *  2. Migren al menos 3 pruebas para que usen la clase:
 *        const tienda = new TiendaPage(page);
 *        await tienda.abrir();
 *        await tienda.agregar('Mochila escolar', 2);
 *  3. Comparen: ¿cuántas líneas ganaron? ¿Qué pasaría si la tienda cambiara el texto de un botón?
 *
 * Regla de oro: el Page Object ofrece ACCIONES (agregar, aplicarCodigo...) y entrega LOCALIZADORES (cantidad, total...).
 * Las aserciones (expect) se quedan en las pruebas.
 */
export class TiendaPage {
  /** El panel del carrito (la tarjeta que tiene el encabezado "Carrito"). */
  readonly carrito: Locator;

  constructor(readonly page: Page) {
    // TODO: precisen este localizador (ver el "Mapa de la tienda" de la guía).
    this.carrito = page.locator('.rounded-lg');
  }

  // ---------- Catálogo ----------
  /** Abre la tienda. */
  async abrir(): Promise<void> {
    await this.page.goto("/");
  }

  /** La tarjeta de un producto del catálogo. */
  tarjeta(_producto: string): Locator {
    return this.page.locator(".rounded-lg").
      filter({
        has: this.page.getByRole("heading", {
          name: _producto,
          level: 3,
        })
      });
  }

  /** Escribe la cantidad en la tarjeta del producto y presiona "Agregar". */
  async agregar(_producto: string, _cantidad = 1): Promise<void> {
    const tarjetas = this.tarjeta(_producto);
    await tarjetas.getByRole("spinbutton").fill(`${_cantidad}`);
    await tarjetas.getByRole("button", { name: "Agregar" }).click();
  }

  async aumentar(_producto: string): Promise<void> {
    await this.carrito
      .getByRole("button", { name: `Aumentar cantidad de ${_producto}` })
      .click();
  }

  async disminuir(_producto: string): Promise<void> {
    await this.carrito
      .getByRole("button", { name: `Disminuir cantidad de ${_producto}` })
      .click();
  }

  async eliminar(_producto: string): Promise<void> {
    await this.carrito
      .getByRole("button", { name: `Eliminar ${_producto}` })
      .click();
  }

  // ---------- Carrito ----------
  /** La línea del carrito de un producto. */
  linea(_producto: string): Locator {
    return this.carrito.getByRole("listitem")
      .filter({ hasText: _producto });
  }

  /** El número de unidades que muestra el carrito para un producto. */
  cantidad(_producto: string): Locator {
    const linea = this.linea(_producto);
    return linea.locator("span");
  }

  /** Escribe el código y presiona "Aplicar". */
  async aplicarCodigo(_codigo: string): Promise<void> {
    await this.carrito.getByPlaceholder("Código de descuento").fill(_codigo);
    await this.carrito.getByRole("button", { name: "Aplicar" }).click();
  }

  /** Valor de una fila del resumen: 'Subtotal', 'Descuento', 'IVA' o 'Total'. */
  total(_fila: 'Subtotal' | 'Descuento' | 'IVA' | 'Total'): Locator {
    return this.carrito.locator(`dt:has-text("${_fila}") + dd`)
  }

  totalText(_fila: 'Subtotal' | 'Descuento' | 'IVA' | 'Total'): Locator {
    return this.carrito.locator(`dt:has-text("${_fila}")`)
  }

  /** Presiona "Ir a pagar". */
  async irAPagar(): Promise<void> {
    await this.carrito.getByRole('button', { name: "Ir a pagar" }).click();
  }


  // ---------- Checkout y confirmación ----------
  /** Un campo del formulario de envío, por el texto de su etiqueta. (Recuerden: getByLabel no funciona aquí.) */
  campo(_etiqueta: 'Nombre completo' | 'Correo electrónico' | 'Dirección de entrega'): Locator {
    return this.page.locator(`p:text-is('${_etiqueta}')`);
  }

  /** Llena el formulario con los datos que reciba. */
  async llenarDatos(_datos: { nombre?: string; correo?: string; direccion?: string }): Promise<void> {
    await this.page.locator('label:text-is("Nombre completo") + input').fill(_datos.nombre!);
    await this.page.locator('label:text-is("Dirección de entrega") + input').fill(_datos.direccion!);
    await this.page.locator('label:text-is("Correo electrónico") + input').fill(_datos.correo!);
  }

  /** Presiona "Confirmar pedido". */
  async confirmar(): Promise<void> {
    await this.page.getByRole('button', { name: "Confirmar pedido" }).click();
  }

  /** Lee el número de pedido de la pantalla de confirmación (ej. "1001"). */
  async numeroDePedido(): Promise<string> {
    return (await this.page.getByText(/Número de pedido:/).textContent())!;
  }

  async devolverse(): Promise<void> {
    await this.page.getByRole("button", { name: "Volver a la tienda" }).click();
  }

  /** Atajo: compra completa de un producto con datos válidos, hasta ver "¡Pedido confirmado!". */
  async comprar(_producto: string, _cantidad = 1, _datos: { nombre?: string; correo?: string; direccion?: string }): Promise<void> {
    await this.agregar(_producto, _cantidad);
    await this.irAPagar();
    await this.llenarDatos(_datos);
    await this.confirmar();
  }
}
