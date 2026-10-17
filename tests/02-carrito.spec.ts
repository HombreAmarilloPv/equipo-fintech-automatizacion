import { test, expect } from "@playwright/test";

/**
 * BLOQUE CARRITO · US-04 a US-07.
 *
 * Cómo se trabaja este archivo:
 *  - La primera prueba ya está resuelta (EJEMPLO GUIADO).
 *  - Las demás están "pendientes": traen un test.fixme(...) que las salta. Para activar una, escriban su cuerpo
 *    y BORREN esa línea. Las pistas están en los comentarios.
 *  - "Nivel" va de 1 (fácil) a 3 (reto). "CAZABUGS" = el criterio probablemente destapa un bug de la tienda.
 *  - Los localizadores de la tienda están en el "Mapa de la tienda" de la guía del laboratorio.
 */

test.describe("US-04 · Agregar productos sin superar el stock", () => {
  // ─────────────── EJEMPLO GUIADO (resuelto) ───────────────
  test("CA1: se pueden agregar 15 cuadernos (stock 15)", async ({ page }) => {
    // ARRANGE: abrir la tienda
    await page.goto("/");

    // ACT: ubicar la tarjeta del cuaderno, escribir 15 en su cantidad y presionar "Agregar"
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", {
        name: "Cuaderno universitario",
        level: 3,
      }),
    });
    await tarjeta.getByRole("spinbutton").fill("15");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();

    // ASSERT: en el carrito (la tarjeta con el encabezado "Carrito") aparece el cuaderno con cantidad 15
    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });
    const linea = carrito
      .getByRole("listitem")
      .filter({ hasText: "Cuaderno universitario" });
    await expect(linea.locator("span")).toHaveText("15");
  });

  // ─────────────── PENDIENTES ───────────────
  test("CA2: no deja agregar 7 mochilas de una vez (stock 6) y avisa", async ({
    page,
  }) => {
    // test.fixme(true, "Pendiente de automatizar"); // ← borren esta línea cuando la implementen
    await page.goto("/");

    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });
    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "mochila", level: 3 }),
    });
    await tarjeta.getByRole("spinbutton").fill("7");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await expect(aviso).toContain("Solo hay 6 unidades");

    // Nivel 2.
    // Pista: la tienda avisa con un alert() del navegador, que BLOQUEA la página hasta que se atiende.
    //   Registren el manejador ANTES del clic:
    //     page.once('dialog', async (dialogo) => { /* guardar dialogo.message() */ await dialogo.accept(); });
    // Verifiquen (1) que el texto del aviso menciona "Solo hay 6 unidades" y (2) que el carrito sigue vacío.
  });

  test("CA3: 4 + 4 mochilas supera el stock (6) y debe rechazarse", async ({
    page,
  }) => {
    test.fail(
      true,
      "LBH-45 · El sistema permite agregar de igual manera y no muestra ningún mensaje",
    );
    // test.fixme(true, "Pendiente de automatizar");
    await page.goto("/");

    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "mochila", level: 3 }),
    });
    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });
    const linea = carrito.getByRole("listitem").filter({ hasText: "mochila" });

    await tarjeta.getByRole("spinbutton").fill("4");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await tarjeta.getByRole("button", { name: "Agregar" }).click();

    await expect(aviso).toContain("Solo hay 6 unidades");
    await expect(linea.locator("span")).toHaveText("4");
  });
});

test.describe("US-05 · Aumentar la cantidad desde el carrito", () => {
  test('CA2: "+" no pasa del stock (6 mochilas)', async ({ page }) => {
    test.fail(
      true,
      "LBH-46 · El sistema permite agregar aunque haya cantidad máxima y no muestra ningún mensaje",
    );
    await page.goto("/");

    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "mochila", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const linea = carrito.getByRole("listitem").filter({ hasText: "mochila" });

    await tarjeta.getByRole("spinbutton").fill("6");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito
      .getByRole("button", { name: "Aumentar cantidad de Mochila escolar" })
      .click();

    await expect(aviso).toContain("No puedes agregar más");
    await expect(linea.locator("span")).toHaveText("6");
    // Agreguen las 6 mochilas del stock y presionen "+" en el carrito
    // (botón con nombre accesible "Aumentar cantidad de Mochila escolar"). La cantidad debe seguir en 6.
  });
});

test.describe("US-06 · Disminuir la cantidad desde el carrito", () => {
  test('CA2: con cantidad 1, "−" elimina el producto', async ({
    page,
  }) => {
    test.fail(
      true,
      "LBH-47 · El sistema permite reducir aunque la cantidad sea 1 y no lo borra",
    );
    await page.goto("/");

    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Cuaderno universitario", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const linea = carrito.getByRole("listitem").filter({ hasText: "Cuaderno universitario" });
  
    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito
      .getByRole("button", { name: "Disminuir cantidad de Cuaderno universitario" })
      .click();
   
    await expect(linea).toHaveCount(0);
    // Nivel 2 · CAZABUGS.
    // Agreguen 1 mochila y presionen "−" (botón "Disminuir cantidad de Mochila escolar").
    // El criterio acepta dos salidas correctas: que se quede en 1 o que el producto se elimine.
    // Elijan una, afírmenla y escriban en el nombre de la prueba cuál eligieron.
  });
});

test.describe("US-07 · Quitar un producto del carrito", () => {
  test("CA2: quitar el único producto deja el carrito vacío y el total en $ 0", async ({
    page,
  }) => {
    await page.goto("/");

    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    const tarjeta = page.locator(".rounded-lg").filter({
      has: page.getByRole("heading", { name: "Cuaderno universitario", level: 3 }),
    });

    const carrito = page
      .locator(".rounded-lg")
      .filter({ has: page.getByRole("heading", { name: "Carrito" }) });

    const linea = carrito.getByRole("listitem").filter({ hasText: "Cuaderno universitario" });
    console.log("Linea antes " + linea.locator("span"));
  
    await tarjeta.getByRole("spinbutton").fill("1");
    await tarjeta.getByRole("button", { name: "Agregar" }).click();
    await carrito
      .getByRole("button", { name: "Eliminar Cuaderno universitario" })
      .click();
   
    await expect(linea).toHaveCount(0);
    await expect(carrito.locator('dt:text-is("Subtotal") + dd')).toHaveText("$ 0");
    // Nivel 1.
    // Agreguen un esfero, quítenlo con el botón "Eliminar Esfero azul" y comprueben el mensaje "Tu carrito está vacío."
    // y que la fila "Total" del carrito muestre $ 0.
  });
});