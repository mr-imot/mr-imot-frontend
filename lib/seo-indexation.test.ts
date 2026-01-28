/**
 * Unit tests for SEO indexation helpers.
 * Run with: pnpm exec vitest run lib/seo-indexation.test.ts
 * Or add to package.json: "test": "vitest run"
 */
import { describe, it, expect } from 'vitest'
import {
  getListingsIndexation,
  getNewsIndexation,
  getDevelopersIndexation,
} from './seo-indexation'

const baseListings = 'https://mrimot.com/listings'
const hubSofia = 'https://mrimot.com/listings/c/sofia-bg'
const baseNews = 'https://mrimot.com/news'
const baseDevelopers = 'https://mrimot.com/developers'

describe('getListingsIndexation', () => {
  it('indexable when no params and no city hub', () => {
    const r = getListingsIndexation({}, baseListings, null)
    expect(r.index).toBe(true)
    expect(r.canonicalPath).toBe(baseListings)
  })

  it('noindex when page=2', () => {
    const r = getListingsIndexation({ page: '2' }, baseListings, null)
    expect(r.index).toBe(false)
    expect(r.canonicalPath).toBe(baseListings)
  })

  it('noindex when type=apartments', () => {
    const r = getListingsIndexation({ type: 'apartments' }, baseListings, null)
    expect(r.index).toBe(false)
  })

  it('indexable when type=all', () => {
    const r = getListingsIndexation({ type: 'all' }, baseListings, null)
    expect(r.index).toBe(true)
  })

  it('noindex when city_key present', () => {
    const r = getListingsIndexation(
      { city_key: 'sofia-bg' },
      baseListings,
      hubSofia
    )
    expect(r.index).toBe(false)
    expect(r.canonicalPath).toBe(hubSofia)
  })

  it('noindex when bounds params present', () => {
    const r = getListingsIndexation(
      { ne_lat: '1', ne_lng: '2', sw_lat: '3', sw_lng: '4' },
      baseListings,
      null
    )
    expect(r.index).toBe(false)
  })

  it('noindex when search_by_map=true', () => {
    const r = getListingsIndexation(
      { search_by_map: 'true' },
      baseListings,
      null
    )
    expect(r.index).toBe(false)
  })
})

describe('getNewsIndexation', () => {
  it('indexable for page 1 or no page', () => {
    expect(getNewsIndexation({}, baseNews).index).toBe(true)
    expect(getNewsIndexation({ page: '1' }, baseNews).index).toBe(true)
  })

  it('noindex for page 2+', () => {
    const r = getNewsIndexation({ page: '2' }, baseNews)
    expect(r.index).toBe(false)
    expect(r.canonicalPath).toBe(baseNews)
  })
})

describe('getDevelopersIndexation', () => {
  it('indexable for page 1 or no page', () => {
    expect(getDevelopersIndexation({}, baseDevelopers).index).toBe(true)
    expect(getDevelopersIndexation({ page: '1' }, baseDevelopers).index).toBe(true)
  })

  it('noindex for page 2+', () => {
    const r = getDevelopersIndexation({ page: '2' }, baseDevelopers)
    expect(r.index).toBe(false)
    expect(r.canonicalPath).toBe(baseDevelopers)
  })
})
