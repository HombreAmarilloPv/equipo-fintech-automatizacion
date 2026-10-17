import { test, expect } from "@playwright/test";
import { TiendaPage } from "../pages/TiendaPage";

test.describe("US-04 · Agregar productos sin superar el stock", () => {
  test("CA1: se pueden agregar 15 cuadernos (stock 15)", async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Cuaderno universitario", 15);
    await expect(tienda.cantidad("Cuaderno universitario")).toHaveText("15");
  });

  test("CA2: no deja agregar 7 mochilas de una vez (stock 6) y avisa", async ({
    page,
  }) => {
    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Mochila escolar", 7);

    await expect(aviso).toContain("Solo hay 6 unidades");
  });

  test("CA3: 4 + 4 mochilas supera el stock (6) y debe rechazarse", async ({
    page,
  }) => {
    test.fail(
      true,
      "LBH-45 · El sistema permite agregar de igual manera y no muestra ningún mensaje",
    );
    // test.fixme(true, "Pendiente de automatizar");
    const tienda = new TiendaPage(page);

    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    await tienda.abrir();
    await tienda.agregar("Mochila escolar", 4);
    await tienda.agregar("Mochila escolar", 4);

    await expect(aviso).toContain("Solo hay 6 unidades");
    await expect(tienda.cantidad("Mochila escolar")).toHaveText("4");
  });
});

test.describe("US-05 · Aumentar la cantidad desde el carrito", () => {
  test('CA2: "+" no pasa del stock (6 mochilas)', async ({ page }) => {
    test.fail(
      true,
      "LBH-46 · El sistema permite agregar aunque haya cantidad máxima y no muestra ningún mensaje",
    );

    const tienda = new TiendaPage(page);
    await tienda.abrir();

    let aviso = "";
    page.once("dialog", async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    await tienda.agregar("Mochila escolar", 6);
    await tienda.aumentar("Mochila escolar");

    await expect(aviso).toContain("No puedes agregar más");
    await expect(tienda.cantidad("Mochila escolar")).toHaveText("6");
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

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Cuaderno universitario", 1);
    await tienda.disminuir("Cuaderno universitario");
    const linea = tienda.linea("Cuaderno universitario");
    await expect(linea).toHaveCount(0);
  });
});

test.describe("US-07 · Quitar un producto del carrito", () => {
  test("CA2: quitar el único producto deja el carrito vacío y el total en $ 0", async ({
    page,
  }) => {

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Cuaderno universitario", 1);
    await tienda.eliminar("Cuaderno universitario");
    const linea = tienda.linea("Cuaderno universitario");

    await expect(linea).toHaveCount(0);
    await expect(tienda.total("Subtotal")).toHaveText("$ 0");
  });
});