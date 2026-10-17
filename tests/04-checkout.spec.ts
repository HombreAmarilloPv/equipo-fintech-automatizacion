import { test, expect } from '@playwright/test';

/**
 * BLOQUE CHECKOUT · US-13 a US-15.
 *
 * IMPORTANTE: en el formulario de envío page.getByLabel('Nombre completo') NO encuentra el campo. Pruébenlo y
 * diagnostiquen por qué (inspeccionen el HTML). Mientras tanto, esto SÍ funciona:
 *     page.locator('label:text-is("Nombre completo") + input')
 * (la etiqueta va justo antes del campo). Los textos de las etiquetas son: "Nombre completo",
 * "Correo electrónico" y "Dirección de entrega".
 */

// Datos listos para la prueba dirigida por datos (US-15). Escribir cada correo a mano invita al error.
const CORREOS_VALIDOS = [
  { correo: 'juan@correo.com', bug:""},
  { correo: 'ana_gomez@gmail.com', bug:""},
  { correo: 'ana.gomez@gmail.com', bug:"LBH_"},
  { correo: 'ana-gomez@gmail.com', bug:"LBH-57"},
  { correo: 'ana+tienda@gmail.com', bug:"LBH-57"},
  {correo: 'ana@universidad.edu.co', bug:"LBH-58"}
];
const CORREOS_MAL_FORMADOS = ['ana.gmail.com', 'ana@', '@gmail.com', 'ana gomez@gmail.com', 'ana@@gmail.com', 'ana@gmail'];

test.describe('US-13 · Ir a pagar desde el carrito', () => {
  test('CA3: con total cero o negativo no se puede ir a pagar', async ({ page }) => {
    test.fail(
      true,
      "LBH-54 · El sistema no deshabilita el botón 'Ir a pagar' y continúa con el proceso.",
    );

    await page.goto("/");

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Mochila escolar", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();

    await carrito.getByRole("button", { name: "Disminuir cantidad de Mochila escolar" })
      .click();
    await expect(carrito.getByRole("button", { name: "Ir a pagar" })).toBeDisabled();


  });


  // Nivel 2 · CAZABUGS.
  // Agreguen 1 mochila y presionen "−" para llevar la cantidad a 0. El botón "Ir a pagar" debe estar deshabilitado
  // (toBeDisabled()). Ojo: esta prueba fallará por el mismo defecto de US-06 CA2, pero es OTRO criterio y OTRO bug:
  // aunque se corrija el "−", la tienda seguiría sin validar el total antes de cobrar
});

test.describe('US-14 · Completar mis datos de envío', () => {
  test('CA1: con el formulario vacío hay un error por cada campo obligatorio', async ({ page }) => {
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

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(formulario.locator("p:text-is('El nombre es obligatorio.')")).toBeVisible();
    await expect(formulario.locator("p:text-is('El correo es obligatorio.')")).toBeVisible();
    await expect(formulario.locator("p:text-is('La dirección es obligatoria.')")).toBeVisible();
    // Nivel 1.
    // Agreguen un producto, "Ir a pagar", presionen "Confirmar pedido" sin llenar nada y comprueben los tres mensajes:
    // "El nombre es obligatorio." · "El correo es obligatorio." · "La dirección es obligatoria."
  });

  test('CA2: un nombre y una dirección de solo espacios se rechazan como vacíos', async ({ page }) => {
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

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();
    await formulario.locator('label:text-is("Nombre completo") + input').fill("   ");
    await formulario.locator('label:text-is("Dirección de entrega") + input').fill("   ");

    await formulario.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(formulario.locator("p:text-is('El nombre es obligatorio.')")).toBeVisible();
    await expect(formulario.locator("p:text-is('La dirección es obligatoria.')")).toBeVisible();
    // Nivel 2. Llenen nombre y dirección con "   " (tres espacios) y un correo válido.
  });
});



test.describe('US-15 · Ingresar un correo electrónico válido', () => {
  for (const {correo, bug} of CORREOS_VALIDOS) {
    test(`CA1-CA3: el correo ${correo} válido se acepta`, async ({ page }) => {
      test.fail(
        bug !== "",
        "LBH-54 · El sistema no deshabilita el botón 'Ir a pagar' y continúa con el proceso.",
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
      await formulario.locator('label:text-is("Correo electrónico") + input').fill(correo);

      await formulario.getByRole("button", { name: "Confirmar pedido" }).click();

      await expect(page.locator("h2:text-is('¡Pedido confirmado!')")).toBeVisible();
    })
  };

  for (const data of CORREOS_MAL_FORMADOS) {
    test(`CA4: El correo ${data} se rechaza con un mensaje claro`, async ({ page }) => {
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
      await formulario.locator('label:text-is("Correo electrónico") + input').fill(data);
      await formulario.getByRole("button", { name: "Confirmar pedido" }).click();

      await expect(formulario.locator("p:text-is('El correo no tiene un formato válido.')")).toBeVisible();
    });
  }
});
