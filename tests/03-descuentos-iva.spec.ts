import { test, expect } from "@playwright/test";

/**
 * BLOQUE DESCUENTOS E IMPUESTOS · US-09 a US-12.
 * Mismas reglas que en 02-carrito.spec.ts: borren el test.fixme(...) cuando implementen la prueba.
 * Valores útiles (producto: Mochila escolar, $ 65.000): DESC10 → descuento $ 6.500 · DESC20 → $ 13.000.
 */

test.describe("US-09 · Aplicar un código de descuento", () => {
  test("CA1: DESC10 descuenta el 10% del subtotal", async ({ page }) => {
    // ← borren esta línea para ejecutarla
    await page.goto("/");
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Mochila escolar", level: 3 }),
    });
    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });
    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    let subtotal = await carrito
      .locator('dt:text-is("Subtotal") + dd')
      .textContent();
    await page.getByPlaceholder("Código de descuento").fill("DESC10");
    await page.getByRole("button", { name: "Aplicar" }).click();
    const total = Number(subtotal?.replace(/\D/g, ""));
    let valor = total * 0.1;
    const totalValor = valor.toLocaleString("es-CO");
    await expect(
      carrito.locator('dt:has-text("Descuento ") + dd'),
    ).toContainText(totalValor);
  });

  const variantes = [
    { data: "desc10", bug: "LBH51" },
    { data: "Desc10", bug: "LBH51" },
    { data: "DESC10", bug: "" },
  ];
  for (const { data, bug } of variantes) {
    test(`CA3: El código ${data} se reconocen igual que DESC10`, async ({
      page,
    }) => {
      test.fail(
        bug != "",
        `${bug} · El sistema solo reconoce el descuento si se usan mayúsculas`,
      );
      await page.goto("/");
      const carrito = page
        .locator(".rounded-lg")
        .filter({ has: page.getByRole("heading", { name: "Carrito" }) });
      await carrito.getByPlaceholder("Código de descuento").fill(data);
      await carrito.getByRole("button", { name: "Aplicar" }).click();
      await expect(carrito.locator('dt:has-text("Descuento")')).toContainText(
        "10%",
      );
    });
  }
});

test.describe("US-10 · Recibir aviso si el código no es válido", () => {
  test("CA1: un código inexistente muestra el aviso y el total no cambia", async ({
    page,
  }) => {
    page.goto("/");

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Esfero azul", level: 3 }),
    });
    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();

    const totalLocator = carrito.locator('dt:text-is("Total") + dd');
    const total = await totalLocator.textContent();

    await carrito.getByPlaceholder("Código de descuento").fill("ABCDEF");
    await carrito.getByRole("button", { name: "Aplicar" }).click();

    await expect(totalLocator).toHaveText(total!);
    await expect(
      carrito.locator('p:has-text("Código de descuento no válido")'),
    ).toBeVisible();
    // Nivel 1.
    // Con 1 mochila ($ 77.350 de total), apliquen ABC123: el mensaje debe ser exactamente
    // "Código de descuento no válido." y el total debe seguir en $ 77.350.
  });

  test("CA2: un código inválido NO borra un descuento válido ya aplicado", async ({
    page,
  }) => {
    test.fail(
      true,
      "LBH-52 · El sistema remueve el descuento anterior y altera el total.",
    );
    page.goto("/");

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Esfero azul", level: 3 }),
    });
    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();

    await carrito.getByPlaceholder("Código de descuento").fill("DESC10");
    await carrito.getByRole("button", { name: "Aplicar" }).click();

    const totalLocator = carrito.locator('dt:text-is("Total") + dd');
    const total = await totalLocator.textContent();

    await carrito.getByPlaceholder("Código de descuento").fill("ABCDEF");
    await carrito.getByRole("button", { name: "Aplicar" }).click();

    await expect(totalLocator).toHaveText(total!);
    // Nivel 2 · CAZABUGS.
    // Apliquen DESC10 (comprueben que quedó aplicado), luego apliquen ABC123. El descuento de $ 6.500 debe mantenerse.
  });
});

test.describe("US-11 · Ver el IVA correcto", () => {
  test("CA2: con descuento, el IVA se calcula sobre el valor descontado", async ({
    page,
  }) => {
    test.fail(
      true,
      "LBH-53 · El sistema aplica el IVA en el subtotal sin tener en cuenta el descuento.",
    );
     page.goto("/");

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Esfero azul", level: 3 }),
    });
    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();

    await carrito.getByPlaceholder("Código de descuento").fill("DESC10");
    await carrito.getByRole("button", { name: "Aplicar" }).click();

    const IVALocator = carrito.locator('dt:text-is("IVA (19%)") + dd');
    const subTotalLocator = await carrito.locator('dt:has-text("Subtotal") + dd').textContent();
    const descuentoLocator = await carrito.locator('dt:has-text("Descuento") + dd').textContent();
    const descuento = Number(descuentoLocator?.replace(/\D/g, ""));
    const subtotal = Number(subTotalLocator?.replace(/\D/g, ""));
    const ivaEsperado = ((subtotal - descuento) * 0.19).toLocaleString("es-CO");

    await expect(IVALocator).toContainText(ivaEsperado);
    // Nivel 3 · CAZABUGS · EL ORÁCULO.
    // Una prueba solo sirve si sabe QUÉ debe pasar sin mirar lo que hace la app.
    // Calculen el valor esperado EN LA PRUEBA, a partir del requisito (IVA = 19% de subtotal − descuento):
    //   const descuento = 65000 * 0.10;  const ivaEsperado = (65000 - descuento) * 0.19;
    // y comparen contra la fila "IVA (19%)" del carrito. Formateen el número como la tienda:
    //   new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
    // Nunca copien el número que muestra la tienda: así la prueba daría por bueno un bug.
  });
});

test.describe("US-12 · Ver el total a pagar correcto", () => {
  test("CA2: con descuento, el total es subtotal − descuento + IVA (IVA sobre lo descontado)", async ({
    page,
  }) => {
    test.fail(
      true,
      "LBH-66 · El sistema hace (subtotal - descuento) + IVA con el subtotal sin descuento.",
    );
    page.goto("/");

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Esfero azul", level: 3 }),
    });
    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();

    await carrito.getByPlaceholder("Código de descuento").fill("DESC10");
    await carrito.getByRole("button", { name: "Aplicar" }).click();

    const totalLocator = carrito.locator('dt:text-is("Total") + dd');
    const subTotalLocator = await carrito.locator('dt:has-text("Subtotal") + dd').textContent();
    const descuentoLocator = await carrito.locator('dt:has-text("Descuento") + dd').textContent();
    const descuento = Number(descuentoLocator?.replace(/\D/g, ""));
    const subtotal = Number(subTotalLocator?.replace(/\D/g, ""));
    const IVA = (subtotal - descuento) * 0.19;
    const totalEsperado = ((subtotal - descuento) + IVA).toLocaleString("es-CO");

    await expect(totalLocator).toContainText(totalEsperado);
    // Nivel 3 · CAZABUGS. Mismo oráculo que US-11, ahora sobre la fila "Total".
    // Pregunta para el reporte: este bug y el de US-11 CA2, ¿son el mismo? ¿Cuántos bugs hay en Jira?
  });
});
