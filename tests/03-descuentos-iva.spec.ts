import { test, expect } from "@playwright/test";
import { TiendaPage } from "../pages/TiendaPage";

test.describe("US-09 · Aplicar un código de descuento", () => {
  test("CA1: DESC10 descuenta el 10% del subtotal", async ({ page }) => {
    // ← borren esta línea para ejecutarla
    const tienda = new TiendaPage(page);
    await tienda.abrir()
    await tienda.agregar("Mochila escolar");
    let subtotal = await tienda.total("Descuento").textContent();
    await tienda.aplicarCodigo("DESC10");
    const total = Number(subtotal?.replace(/\D/g, ""));
    let valor = total * 0.1;
    const totalValor = valor.toLocaleString("es-CO");
    await expect(tienda.total("Descuento")).toContainText(totalValor);
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

      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.aplicarCodigo(data);
      await expect(tienda.totalText("Descuento")).toContainText("10%");
    });
  }
});

test.describe("US-10 · Recibir aviso si el código no es válido", () => {
  test("CA1: un código inexistente muestra el aviso y el total no cambia", async ({
    page,
  }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Esfero azul", 1);
    await tienda.aplicarCodigo("ABCDEF");
    await expect(
      tienda.carrito.locator('p:has-text("Código de descuento no válido")'),
    ).toBeVisible();
  });

  test("CA2: un código inválido NO borra un descuento válido ya aplicado", async ({
    page,
  }) => {
    test.fail(
      true,
      "LBH-52 · El sistema remueve el descuento anterior y altera el total.",
    );

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Esfero azul", 1);
    await tienda.aplicarCodigo("DESC10");
    const totalLocator = tienda.total("Total");
    const total = await totalLocator.textContent();
    await tienda.aplicarCodigo("ABCDEF");
    await expect(totalLocator).toHaveText(total!);
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

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Esfero azul", 1);
    await tienda.aplicarCodigo("DESC10");
    const IVALocator = tienda.total("IVA");
    const subTotaLContent = await tienda.total("Subtotal").textContent();
    const descuentoContent = await tienda.total("Descuento").textContent();
    const descuento = Number(descuentoContent?.replace(/\D/g, ""));
    const subtotal = Number(subTotaLContent?.replace(/\D/g, ""));
    const ivaEsperado = ((subtotal - descuento) * 0.19).toLocaleString("es-CO");
    await expect(IVALocator).toContainText(ivaEsperado);
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

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Esfero azul", 1);
    await tienda.aplicarCodigo("DESC10");
    const totalLocator = tienda.total("Total");
    const subTotalContent = await tienda.total("Subtotal").textContent();
    const descuentoContent = await tienda.total("Descuento").textContent();
    const descuento = Number(descuentoContent?.replace(/\D/g, ""));
    const subtotal = Number(subTotalContent?.replace(/\D/g, ""));
    const IVA = (subtotal - descuento) * 0.19;
    const totalEsperado = ((subtotal - descuento) + IVA).toLocaleString("es-CO");

    await expect(totalLocator).toContainText(totalEsperado);

  });
});
