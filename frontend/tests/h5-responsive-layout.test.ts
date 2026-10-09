import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('H5 narrow viewport layout guard', () => {
  it('allows phone content and record cards to shrink without horizontal clipping', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/base.css'), 'utf8')

    expect(css).toContain('.phone-shell{width:calc(100vw - 48px);max-width:430px}')
    expect(css).toContain('.phone-shell main{min-width:0;padding:16px;overflow-y:auto;overflow-x:hidden}')
    expect(css).toContain('.phone-shell .record-grid{min-width:0;grid-template-columns:minmax(0,1fr)}')
    expect(css).toContain('.phone-shell .record-card>header{align-items:flex-start;flex-wrap:wrap}')
    expect(css).toContain('.phone-shell .status-chip{max-width:100%;overflow-wrap:anywhere}')
  })
})
