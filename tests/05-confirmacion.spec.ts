import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

test.describe('US-16 · Que mis datos no queden a la vista de otra persona', () => {
  test('CA1: tras confirmar y empezar otra compra, el formulario aparece vacío', async ({ page }) => {
    test.fail(
      true,
      "LBH-60 · El sistema no elimina los datos al realizar una compra y luego volver al formulario.",
    );

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar("Mochila escolar", 1, { nombre: "Juan", direccion: "Cra #52", correo: "juan@gmail.com" });
    await tienda.devolverse();
    await tienda.agregar("Mochila escolar", 2);
    await tienda.irAPagar();

    await expect(page.locator('label:text-is("Nombre completo") + input')).toHaveValue("");

  });
});

test.describe('US-17 · Confirmar mi pedido', () => {
  test('CA1: con datos válidos veo "¡Pedido confirmado!" y un número de pedido', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar("Mochila escolar", 1, { nombre: "Juan", direccion: "Cra #52", correo: "juan@gmail.com" });

    await expect(page.locator("h2:text-is('¡Pedido confirmado!')")).toBeVisible();
    await expect(page.getByText(/Número de pedido:/)).toHaveText(/#\d+/);

  });

  test('CA2: un segundo pedido (sin recargar) tiene otro número', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar("Mochila escolar", 1, { nombre: "Juan", direccion: "Cra #52", correo: "juan@gmail.com" });

    const codigoLocale = page.getByText(/Número de pedido:/)
    const codigo = await codigoLocale.textContent();
    await tienda.devolverse();
    await tienda.comprar("Mochila escolar", 1, { nombre: "Juan", direccion: "Cra #52", correo: "juan@gmail.com" });

    await expect(codigoLocale).not.toHaveText(codigo!);
  });

  test('CA3: un pedido hecho después de recargar la página no repite un número anterior', async ({ page }) => {
    test.fail(
      true,
      "LBH-61 · El sistema vuelve a emitir el mismo código.",
    );
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar("Mochila escolar", 1, { nombre: "Juan", direccion: "Cra #52", correo: "juan@gmail.com" });

    const codigoLocale = page.getByText(/Número de pedido:/)
    const codigo = await codigoLocale.textContent();
    await page.reload();
    await tienda.comprar("Mochila escolar", 1, { nombre: "Juan", direccion: "Cra #52", correo: "juan@gmail.com" });

    await expect(codigoLocale).not.toHaveText(codigo!);
  });
});

test.describe('US-19 · Empezar una compra nueva con el carrito limpio', () => {
  test('CA1: tras confirmar, el carrito está vacío y el contador marca 0', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar("Mochila escolar", 1, { nombre: "Juan", direccion: "Cra #52", correo: "juan@gmail.com" });
    await tienda.devolverse();

    await expect(page.locator('span:has-text("artículo(s)")')).toContainText("0 artículo(s)");
    await expect(tienda.carrito.getByText("Tu carrito está vacío")).toBeVisible();
  });
});
