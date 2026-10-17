import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

const CORREOS_VALIDOS = [
  { correo: 'juan@correo.com', bug: "" },
  { correo: 'ana_gomez@gmail.com', bug: "" },
  { correo: 'ana.gomez@gmail.com', bug: "LBH_57" },
  { correo: 'ana-gomez@gmail.com', bug: "LBH-57" },
  { correo: 'ana+tienda@gmail.com', bug: "LBH-57" },
  { correo: 'ana@universidad.edu.co', bug: "LBH-58" }
];
const CORREOS_MAL_FORMADOS = ['ana.gmail.com', 'ana@', '@gmail.com', 'ana gomez@gmail.com', 'ana@@gmail.com', 'ana@gmail'];

test.describe('US-13 · Ir a pagar desde el carrito', () => {
  test('CA3: con total cero o negativo no se puede ir a pagar', async ({ page }) => {
    test.fail(
      true,
      "LBH-54 · El sistema no deshabilita el botón 'Ir a pagar' y continúa con el proceso.",
    );

    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Mochila escolar", 1);
    await tienda.disminuir("Mochila escolar");

    await expect(tienda.carrito.getByRole("button", { name: "Ir a pagar" })).toBeDisabled();
  });

});

test.describe('US-14 · Completar mis datos de envío', () => {
  test('CA1: con el formulario vacío hay un error por cada campo obligatorio', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Mochila escolar", 1);
    await tienda.irAPagar();
    await tienda.confirmar();

    await expect(page.locator("p:text-is('El nombre es obligatorio.')")).toBeVisible();
    await expect(page.locator("p:text-is('El correo es obligatorio.')")).toBeVisible();
    await expect(page.locator("p:text-is('La dirección es obligatoria.')")).toBeVisible();
  });

  test('CA2: un nombre y una dirección de solo espacios se rechazan como vacíos', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar("Mochila escolar", 1);
    await tienda.irAPagar();
    await tienda.llenarDatos({nombre: "   ", direccion: "   ", correo: ""});
    await tienda.confirmar();

    await expect(page.locator("p:text-is('El nombre es obligatorio.')")).toBeVisible();
    await expect(page.locator("p:text-is('La dirección es obligatoria.')")).toBeVisible();

  });
});



test.describe('US-15 · Ingresar un correo electrónico válido', () => {
  for (const { correo, bug } of CORREOS_VALIDOS) {
    test(`CA1-CA3: el correo ${correo} válido se acepta`, async ({ page }) => {
      test.fail(
        bug !== "",
        `${bug} · El correo ingresado impide continuar y muestra un mensaje de error.`,
      );

      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar("Mochila escolar", 1);
      await tienda.irAPagar();
      await tienda.llenarDatos({nombre: "Juan", direccion: "Cra $52", correo: correo});
      await tienda.confirmar();

      await expect(page.locator("h2:text-is('¡Pedido confirmado!')")).toBeVisible();
    })
  };

  for (const data of CORREOS_MAL_FORMADOS) {
    test(`CA4: El correo ${data} se rechaza con un mensaje claro`, async ({ page }) => {
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar("Mochila escolar", 1);
      await tienda.irAPagar();
      await tienda.llenarDatos({nombre: "Juan", direccion: "Cra $52", correo: data});
      await tienda.confirmar();

      await expect(page.locator("p:text-is('El correo no tiene un formato válido.')")).toBeVisible();
    });
  }
});
