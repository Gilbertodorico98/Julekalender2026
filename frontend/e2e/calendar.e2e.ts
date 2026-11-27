import { expect, test, type Page } from '@playwright/test'

/** Et tidspunkt i dansk vintertid (UTC+1), fx cph('2026-12-05T12:00:00'). */
const cph = (local: string) => new Date(`${local}+01:00`)

const door = (page: Page, name: RegExp) => page.getByRole('button', { name })

async function press(page: Page, name: RegExp) {
  const target = door(page, name)
  // Rigtigt tryk på touch-enheder (iPhone), klik med mus på desktop.
  if (test.info().project.use.hasTouch) await target.tap()
  else await target.click()
}

async function snap(page: Page, label: string) {
  const file = `tmp/screens/${test.info().project.name.replace(/\s+/g, '-')}-${label}.png`
  await page.screenshot({ path: file, fullPage: true })
}

let errors: string[]

test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
})

test.afterEach(async ({ page }) => {
  expect(errors, 'ingen fejl i konsollen').toEqual([])

  const m = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    inner: window.innerWidth,
    screenW: window.screen.width,
  }))
  // WebKits mobil-emulering på Windows med skærmskalering (fx 125 %) giver et forkert
  // innerWidth (256 i stedet for 320), selv på en tom side. Bredden måles så i stedet
  // af projektet "iPhone SE layout (Chromium)", som emulerer korrekt.
  const brokenEmulation = test.info().project.use.isMobile && m.inner !== m.screenW
  if (brokenEmulation) {
    test.info().annotations.push({ type: 'note', description: `bredde-tjek sprunget over (innerWidth ${m.inner} ≠ ${m.screenW})` })
    return
  }
  expect(m.scrollW, 'ingen vandret scroll').toBeLessThanOrEqual(m.inner)
})

test('før advent er alt låst, og låste låger kan ikke åbnes', async ({ page }) => {
  await page.clock.install({ time: cph('2026-11-27T12:00:00') })
  await page.goto('./')

  await expect(page.getByText(/1\. søndag i advent åbner om/)).toBeVisible()
  await expect(door(page, /er låst indtil/)).toHaveCount(28)
  await snap(page, '27-nov')

  await press(page, /^Låge 7 er låst/)
  await expect(page.getByRole('status')).toHaveText('Tålmodighed! Låge 7 åbner d. 7. december.')
  await expect(door(page, /^Låge 7 er låst/)).not.toHaveClass(/door--open/)

  await press(page, /^1\. søndag i advent er låst/)
  await expect(page.getByRole('status')).toContainText('åbner d. 29. november')
})

test('1. advent åbner ved midnat dansk tid, alt andet er låst', async ({ page }) => {
  await page.clock.install({ time: cph('2026-11-29T00:00:05') })
  await page.goto('./')

  await expect(page.getByText(/Første låge åbner om/)).toBeVisible()
  await expect(door(page, /^Låge \d+ er låst/)).toHaveCount(24)
  await expect(door(page, /^[234]\. søndag i advent er låst/)).toHaveCount(3)

  await press(page, /^Åbn 1\. søndag i advent/)
  await expect(door(page, /^1\. søndag i advent: Gave/)).toBeVisible()
  await page.waitForTimeout(1000) // lad flip-animationen køre færdig
  await snap(page, '29-nov-gave-aabnet')
})

test('d. 5. dec: låge 1-5 kan åbnes, låge 6 ikke, og åbne låger huskes', async ({ page }) => {
  await page.clock.install({ time: cph('2026-12-05T12:00:00') })
  await page.goto('./')

  await expect(page.getByText('I dag må du åbne låge 5.')).toBeVisible()
  await expect(door(page, /^Åbn Låge [1-5]$/)).toHaveCount(5)
  await expect(door(page, /^Låge 6 er låst/)).toBeVisible()
  await expect(door(page, /^Åbn Låge 5$/)).toHaveClass(/door--today/)

  await press(page, /^Åbn Låge 3$/)
  await press(page, /^Låge 6 er låst/)
  await expect(door(page, /^Låge 6 er låst/)).not.toHaveClass(/door--open/)

  const opened = door(page, /^Låge 3: Kalenderlys$/)
  await expect(opened).toBeVisible()
  await expect(opened.getByText('Husk at brænde lyset ned til 3-tallet i dag.')).toBeVisible()

  // Efter flippet skal forsiden være helt skjult. Ellers stak et spejlvendt tal ud i Safari.
  await expect(opened.locator('.door__front')).toBeHidden({ timeout: 3000 })
  await expect(door(page, /^Låge 6 er låst/).locator('.door__front')).toBeVisible()
  await snap(page, '5-dec-laage-3-aabnet')

  await page.reload()
  await expect(door(page, /^Låge 3: Kalenderlys$/)).toBeVisible()
})

test('ved midnat låses næste låge op uden genindlæsning', async ({ page }) => {
  await page.clock.install({ time: cph('2026-12-05T23:59:50') })
  await page.goto('./')

  await expect(door(page, /^Låge 6 er låst/)).toBeVisible()
  await page.clock.fastForward(20_000)
  await expect(door(page, /^Åbn Låge 6$/)).toBeVisible()
})

test('efter juleaften er alle låger åbne at åbne', async ({ page }) => {
  await page.clock.install({ time: cph('2026-12-26T12:00:00') })
  await page.goto('./')

  await expect(page.getByText('Alle låger er låst op. Glædelig jul!')).toBeVisible()
  await expect(door(page, /er låst indtil/)).toHaveCount(0)
})

test.describe('bruger i en anden tidszone', () => {
  test.use({ timezoneId: 'America/New_York' })

  test('bruger dansk dato, ikke brugerens egen', async ({ page }) => {
    // 18:30 d. 4. dec i New York = 00:30 d. 5. dec i Danmark
    await page.clock.install({ time: new Date('2026-12-04T23:30:00Z') })
    await page.goto('./')

    await expect(door(page, /^Åbn Låge 5$/)).toBeVisible()
    await expect(door(page, /^Låge 6 er låst/)).toBeVisible()
  })
})
