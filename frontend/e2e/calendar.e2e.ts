import { expect, test, type Page } from '@playwright/test'
import { MASTER_HASH, PASSWORD_HASH } from '../src/password'

/** Et tidspunkt i dansk vintertid (UTC+1), fx cph('2026-12-05T12:00:00'). */
const cph = (local: string) => new Date(`${local}+01:00`)

const door = (page: Page, name: RegExp) => page.getByRole('button', { name })

async function press(page: Page, name: RegExp) {
  const target = door(page, name)
  // Rigtigt tryk på touch-enheder (iPhone), klik med mus på desktop.
  if (test.info().project.use.hasTouch) await target.tap()
  else await target.click()
}

/**
 * WebKits mobil-emulering på Windows med skærmskalering (fx 125 %) giver forkert
 * innerWidth/innerHeight og forskudte tryk-koordinater. Chromium-iPhone-projektet
 * dækker så tryk og mål; her bruges tastaturet i stedet.
 */
async function isBrokenEmulation(page: Page) {
  if (!test.info().project.use.isMobile) return false
  return page.evaluate(() => window.innerWidth !== window.screen.width)
}

async function pressButton(page: Page, name: string) {
  const target = page.getByRole('button', { name, exact: true })
  if (!test.info().project.use.hasTouch) return target.click()
  if (!(await isBrokenEmulation(page))) return target.tap()
  test.info().annotations.push({ type: 'note', description: `"${name}" aktiveret med Enter pga. emulering` })
  await target.focus()
  await page.keyboard.press('Enter')
}

async function snap(page: Page, label: string) {
  const file = `tmp/screens/${test.info().project.name.replace(/\s+/g, '-')}-${label}.png`
  await page.screenshot({ path: file, fullPage: true })
}

// Adgangsnøglen er hashen, ikke kodeordet, så den må gerne stå her.
const ACCESS_KEY = 'julekalender2026-access'
const ACCESS_VALUE = PASSWORD_HASH
const GATE_SUITE = 'kodeord'

let errors: string[]

test.beforeEach(async ({ page }) => {
  // Kalendertestene springer kodeordet over. Kodeord-testene logger selv ind.
  if (!test.info().titlePath.includes(GATE_SUITE)) {
    await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [ACCESS_KEY, ACCESS_VALUE])
  }
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
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Der ligger en gave til dig!')
  await snap(page, '29-nov-gave-aabnet')
  await pressButton(page, 'Luk')
  await expect(dialog).toHaveCount(0)
})

test('d. 5. dec: låge 1-5 kan åbnes, låge 6 ikke, og åbne låger huskes', async ({ page }) => {
  await page.clock.install({ time: cph('2026-12-05T12:00:00') })
  await page.goto('./')

  await expect(page.getByText('I dag må du åbne låge 5.')).toBeVisible()
  await expect(door(page, /^Åbn Låge [1-5]$/)).toHaveCount(5)
  await expect(door(page, /^Låge 6 er låst/)).toBeVisible()
  await expect(door(page, /^Åbn Låge 5$/)).toHaveClass(/door--today/)

  await press(page, /^Åbn Låge 3$/)
  const opened = door(page, /^Låge 3: Kalenderlys/)
  await expect(opened).toBeVisible()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Husk at brænde lyset ned til 3-tallet i dag.')
  await pressButton(page, 'Luk')
  await expect(dialog).toHaveCount(0)

  await press(page, /^Låge 6 er låst/)
  await expect(door(page, /^Låge 6 er låst/)).not.toHaveClass(/door--open/)
  await expect(dialog).toHaveCount(0)

  // Efter flippet skal forsiden være helt skjult. Ellers stak et spejlvendt tal ud i Safari.
  await expect(opened.locator('.door__front')).toBeHidden({ timeout: 3000 })
  await expect(door(page, /^Låge 6 er låst/).locator('.door__front')).toBeVisible()
  await snap(page, '5-dec-laage-3-aabnet')

  await page.reload()
  await expect(door(page, /^Låge 3: Kalenderlys/)).toBeVisible()
})

test('d. 10. dec: gaven vises i popup, kan lukkes og vises igen', async ({ page }) => {
  await page.clock.install({ time: cph('2026-12-10T12:00:00') })
  await page.goto('./')

  await press(page, /^Åbn Låge 10$/)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Låge 10')
  await expect(dialog).toContainText('10 minutters massage! Indløs den, når du har lyst.')
  await expect(page.getByRole('button', { name: 'Luk' })).toBeFocused()

  // Hele popup'en skal kunne ses på skærmen, også på iPhone SE (måles ikke i forstyrret emulering).
  if (!(await isBrokenEmulation(page))) {
    const fits = await dialog.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return r.top >= 0 && r.bottom <= window.innerHeight && el.scrollHeight <= el.clientHeight + 1
    })
    expect(fits, 'popup passer på skærmen').toBe(true)
  }
  await snap(page, '10-dec-massage')

  await pressButton(page, 'Luk')
  await expect(dialog).toHaveCount(0)

  // Tryk på den åbne låge viser gaven igen, og Escape lukker.
  await press(page, /^Låge 10: Dagens gave/)
  await expect(dialog).toContainText('10 minutters massage!')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})

test('åbnede låger har intet afskåret indhold', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('julekalender2026-opened', JSON.stringify(Array.from({ length: 24 }, (_, i) => i + 1)))
    localStorage.setItem('julekalender2026-advent-opened', '[1,2,3,4]')
  })
  await page.clock.install({ time: cph('2026-12-26T12:00:00') })
  await page.goto('./')

  await expect(page.locator('.door--open')).toHaveCount(28)
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('.door__inside')]
      .filter((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.closest('.door')?.getAttribute('aria-label')),
  )
  expect(clipped, 'låger med afskåret indhold').toEqual([])
  await snap(page, '26-dec-alle-aabne')
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

// Det rigtige kodeord står ikke i repoet: CALENDAR_PASSWORD=... npm run e2e
const PASSWORD = process.env.CALENDAR_PASSWORD

test.describe(GATE_SUITE, () => {
  async function submit(page: Page) {
    const button = page.getByRole('button', { name: 'Lås op' })
    if (!test.info().project.use.hasTouch) return button.click()
    // WebKits mobil-emulering på Windows med skærmskalering (125 %) forskyder tryk-koordinaterne,
    // så tryk på knappen rammer ved siden af. Der sendes så med tastaturets "Gå"/Enter,
    // som også er en rigtig måde at logge ind på iPhone. Chromium-iPhone tester knap-trykket.
    const broken = await page.evaluate(() => window.innerWidth !== window.screen.width)
    if (!broken) return button.tap()
    test.info().annotations.push({ type: 'note', description: 'sendt med Enter pga. emulering' })
    await page.getByLabel('Skriv kodeordet for at åbne kalenderen').press('Enter')
  }

  test('kalenderen er skjult før login, og forkert kodeord afvises', async ({ page }) => {
    await page.clock.install({ time: cph('2026-12-05T12:00:00') })
    await page.goto('./')

    const field = page.getByLabel('Skriv kodeordet for at åbne kalenderen')
    await expect(field).toBeVisible()
    await expect(page.locator('.door')).toHaveCount(0)
    await snap(page, 'kodeord')

    await field.fill('forkert')
    await submit(page)
    await expect(page.getByRole('alert')).toHaveText('Forkert kodeord. Prøv igen.')
    await expect(page.locator('.door')).toHaveCount(0)
    await expect(field).toHaveValue('')

    // Feltet må ikke være mindre end 16px, ellers zoomer iPhone ind.
    const fontSize = await field.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(fontSize).toBeGreaterThanOrEqual(16)
  })

  test('rigtigt kodeord åbner kalenderen og huskes', async ({ page }) => {
    test.skip(!PASSWORD, 'sæt CALENDAR_PASSWORD for at teste det rigtige kodeord')
    await page.clock.install({ time: cph('2026-12-05T12:00:00') })
    await page.goto('./')

    const field = page.getByLabel('Skriv kodeordet for at åbne kalenderen')
    // Skriv som på et tastatur, med stort forbogstav ligesom iPhone gør automatisk.
    await field.pressSequentially(PASSWORD!.charAt(0).toUpperCase() + PASSWORD!.slice(1))
    await submit(page)

    await expect(door(page, /^Åbn Låge 5$/)).toBeVisible()
    await page.reload()
    await expect(door(page, /^Åbn Låge 5$/)).toBeVisible()
    await expect(page.getByLabel('Skriv kodeordet for at åbne kalenderen')).toHaveCount(0)
    // Familiens kodeord giver ikke master-adgang.
    await expect(page.getByRole('region', { name: 'Master-visning' })).toHaveCount(0)
    await expect(door(page, /^Låge 6 er låst/)).toBeVisible()
  })

  test('Enter i feltet låser op', async ({ page }) => {
    test.skip(!PASSWORD, 'sæt CALENDAR_PASSWORD for at teste det rigtige kodeord')
    await page.goto('./')
    const field = page.getByLabel('Skriv kodeordet for at åbne kalenderen')
    await field.fill(PASSWORD!)
    await field.press('Enter')
    await expect(page.getByRole('heading', { name: 'Adventsgaver' })).toBeVisible()
  })

  test('login virker også på http:// (uden crypto.subtle)', async ({ page }) => {
    test.skip(!PASSWORD, 'sæt CALENDAR_PASSWORD for at teste det rigtige kodeord')
    // På http:// findes crypto.subtle ikke; så skal reserve-SHA-256 bruges.
    await page.addInitScript(() => {
      Object.defineProperty(globalThis.crypto, 'subtle', { value: undefined, configurable: true })
    })
    await page.goto('./')
    const field = page.getByLabel('Skriv kodeordet for at åbne kalenderen')
    await field.fill('forkert')
    await field.press('Enter')
    await expect(page.getByRole('alert')).toHaveText('Forkert kodeord. Prøv igen.')
    await field.fill(PASSWORD!)
    await field.press('Enter')
    await expect(page.getByRole('heading', { name: 'Adventsgaver' })).toBeVisible()
  })

  test('master-kodeord giver master-visning', async ({ page }) => {
    test.skip(!MASTER_PASSWORD, 'sæt CALENDAR_MASTER_PASSWORD for at teste master-kodeordet')
    await page.clock.install({ time: cph('2026-11-27T12:00:00') })
    await page.goto('./')
    const field = page.getByLabel('Skriv kodeordet for at åbne kalenderen')
    await field.pressSequentially(MASTER_PASSWORD!)
    await submit(page)
    await expect(page.getByRole('region', { name: 'Master-visning' })).toBeVisible()
    await expect(door(page, /er låst indtil/)).toHaveCount(0)
  })
})

// Master-kodeordet står heller ikke i repoet: CALENDAR_MASTER_PASSWORD=... npm run e2e
const MASTER_PASSWORD = process.env.CALENDAR_MASTER_PASSWORD

test.describe('master-visning', () => {
  test.beforeEach(async ({ page }) => {
    // Log ind som master én gang (ikke igen efter "Afslut master" + genindlæsning).
    await page.addInitScript((hash) => {
      if (sessionStorage.getItem('e2e-master-seeded')) return
      localStorage.setItem('julekalender2026-master', hash)
      sessionStorage.setItem('e2e-master-seeded', '1')
    }, MASTER_HASH)
    await page.clock.install({ time: cph('2026-11-27T12:00:00') })
  })

  test('alle låger kan åbnes nu uden at røre familiens låger', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('region', { name: 'Master-visning' })).toBeVisible()
    await expect(door(page, /er låst indtil/)).toHaveCount(0)
    await expect(door(page, /^Åbn /)).toHaveCount(28)
    await snap(page, 'master')

    await press(page, /^Åbn Låge 10$/)
    await expect(page.getByRole('dialog')).toContainText('10 minutters massage!')
    await pressButton(page, 'Luk')

    const stored = await page.evaluate(() => ({
      family: localStorage.getItem('julekalender2026-opened'),
      master: localStorage.getItem('julekalender2026-opened-master'),
    }))
    expect(stored.family, 'familiens låger er urørte').toBeNull()
    expect(stored.master).toBe('[10]')
  })

  test('"Vis som dato" viser låsningen på en bestemt dag', async ({ page }) => {
    await page.goto('./')
    await page.getByLabel('Vis som dato').selectOption('2026-12-05')
    await expect(door(page, /^Åbn Låge 5$/)).toBeVisible()
    await expect(door(page, /^Låge 6 er låst/)).toBeVisible()
    await expect(door(page, /^3\. søndag i advent er låst/)).toBeVisible()

    await page.getByLabel('Vis som dato').selectOption('2026-11-29')
    await expect(door(page, /^Åbn 1\. søndag i advent$/)).toBeVisible()
    await expect(door(page, /^Låge \d+ er låst/)).toHaveCount(24)
  })

  test('"Luk alle låger igen" og "Afslut master"', async ({ page }) => {
    await page.goto('./')
    await press(page, /^Åbn Låge 3$/)
    await pressButton(page, 'Luk')
    await expect(door(page, /^Låge 3: Kalenderlys/)).toBeVisible()

    await pressButton(page, 'Luk alle låger igen')
    await expect(door(page, /^Åbn Låge 3$/)).toBeVisible()

    await pressButton(page, 'Afslut master')
    await expect(page.getByRole('heading', { name: 'Adventsgaver' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Master-visning' })).toHaveCount(0)
    // Tilbage i almindelig visning d. 27. nov: alt er låst, og man er stadig logget ind.
    await expect(door(page, /er låst indtil/)).toHaveCount(28)
  })
})
