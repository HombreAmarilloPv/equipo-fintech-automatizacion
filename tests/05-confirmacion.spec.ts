import { test, expect } from '@playwright/test';

/**
 * BLOQUE CONFIRMACIÓN · US-16 a US-19.
 *
 * Un pedido completo son varios pasos (agregar, ir a pagar, llenar datos, confirmar). Cuando lo escriban por tercera vez
 * en la misma forma, ya sienten por qué existe el Page Object (Parte 5): escribir "comprar()" una sola vez.
 * Datos válidos de ejemplo: nombre "Ana Gómez", correo "ana@correo.com", dirección "Calle 10 # 20-30".
 * Recuerden: cada prueba arranca con el navegador limpio (carrito vacío, sin memoria de la anterior).
 */

test.describe('US-16 · Que mis datos no queden a la vista de otra persona', () => {
  test('CA1: tras confirmar y empezar otra compra, el formulario aparece vacío', async ({ page }) => {
    test.fail(
      true,
      "LBH-60 · El sistema no elimina los datos al realizar una compra y luego volver al formulario.",
    );

    await page.goto("/");
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Mochila escolar", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const formulario = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Datos de envío" }) });

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await formulario.locator('label:text-is("Nombre completo") + input').fill("Juan");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("Cra #52");
    await formulario.locator('label:text-is("Correo electrónico") + input').fill("juan@gmail.com");

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    await page.getByRole("button", { name: "Volver a la tienda" }).click();

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await expect(formulario.locator('label:text-is("Nombre completo") + input')).toHaveValue("");
    // Nivel 3 · CAZABUGS.
    // Compren algo, presionen "Volver a la tienda", agreguen otro producto, "Ir a pagar" y comprueben que los tres
    // campos están vacíos:  await expect(campo).toHaveValue('')
  });
});

test.describe('US-17 · Confirmar mi pedido', () => {
  test('CA1: con datos válidos veo "¡Pedido confirmado!" y un número de pedido', async ({ page }) => {
    await page.goto("/");
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Mochila escolar", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const formulario = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Datos de envío" }) });

    const confirmacion = page
      .locator(".rounded-lg")
      .filter({has: page.getByRole('heading', {name: "¡Pedido confirmado!"})})
    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await formulario.locator('label:text-is("Nombre completo") + input').fill("Juan");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("Cra #52");
    await formulario.locator('label:text-is("Correo electrónico") + input').fill("juan@gmail.com");

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    await expect(confirmacion.locator("h2:text-is('¡Pedido confirmado!')")).toBeVisible();
    await expect(confirmacion.getByText(/Número de pedido:/)).toHaveText(/#\d+/);
    
    // Nivel 1. Compren un producto con datos válidos. Comprueben el encabezado "¡Pedido confirmado!" y que el texto
    // "Número de pedido: #..." contiene un número (expresión regular /#\d+/).
  });

  test('CA2: un segundo pedido (sin recargar) tiene otro número', async ({ page }) => {
    await page.goto("/");
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Mochila escolar", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const formulario = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Datos de envío" }) });

    const confirmacion = page
      .locator(".rounded-lg")
      .filter({has: page.getByRole('heading', {name: "¡Pedido confirmado!"})})
    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await formulario.locator('label:text-is("Nombre completo") + input').fill("Juan");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("Cra #52");
    await formulario.locator('label:text-is("Correo electrónico") + input').fill("juan@gmail.com");

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    const codigoLocale = confirmacion.getByText(/Número de pedido:/)
    const codigo = await codigoLocale.textContent();
    await confirmacion.getByRole("button", { name: "Volver a la tienda"}).click();

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await formulario.locator('label:text-is("Nombre completo") + input').fill("Juan");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("Cra #52");
    await formulario.locator('label:text-is("Correo electrónico") + input').fill("juan@gmail.com");
    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    
    await expect(codigoLocale).not.toHaveText(codigo!);
  });

  test('CA3: un pedido hecho después de recargar la página no repite un número anterior', async ({ page }) => {
    test.fail(
      true,
      "LBH-61 · El sistema vuelve a emitir el mismo código.",
    );
    await page.goto("/");
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Mochila escolar", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const formulario = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Datos de envío" }) });

    const confirmacion = page
      .locator(".rounded-lg")
      .filter({has: page.getByRole('heading', {name: "¡Pedido confirmado!"})})
    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await formulario.locator('label:text-is("Nombre completo") + input').fill("Juan");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("Cra #52");
    await formulario.locator('label:text-is("Correo electrónico") + input').fill("juan@gmail.com");

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    const codigoLocale = confirmacion.getByText(/Número de pedido:/)
    const codigo = await codigoLocale.textContent();
    await page.reload();

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await formulario.locator('label:text-is("Nombre completo") + input').fill("Juan");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("Cra #52");
    await formulario.locator('label:text-is("Correo electrónico") + input').fill("juan@gmail.com");
    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    
     await expect(codigoLocale).not.toHaveText(codigo!);
  });
});

test.describe('US-19 · Empezar una compra nueva con el carrito limpio', () => {
  test('CA1: tras confirmar, el carrito está vacío y el contador marca 0', async ({ page }) => {
    await page.goto("/");
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Mochila escolar", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const formulario = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Datos de envío" }) });
    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito.getByRole("button", { name: "Ir a pagar" }).click();

    await formulario.locator('label:text-is("Nombre completo") + input').fill("Juan");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("Cra #52");
    await formulario.locator('label:text-is("Correo electrónico") + input').fill("juan@gmail.com");

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    await page.getByRole("button", {name: "Volver a la tienda"}).click();

    await expect(page.locator('span:has-text("artículo(s)")')).toContainText("0 artículo(s)");
    await expect(carrito.getByText("Tu carrito está vacío")).toBeVisible();
  });
});
