import { describe, expect, it } from 'vitest';
import {
  windowState,
  liveCampaigns,
  bandCampaigns,
  stripCampaigns,
  activationFor,
  isoToday,
  type CampaignDoc,
} from '@/lib/campaigns';

/* The campaign scheduler decides what a country sees on its front page, so its
 * window logic is locked here: a market must never see a campaign it has not
 * switched on, an expired campaign must disappear on its own, and several live
 * campaigns must come back in a defined order. */

const TODAY = '2026-08-31';

const doc = (name: string, activations: CampaignDoc['activations']): CampaignDoc => ({
  _id: name,
  name,
  activations,
});

describe('windowState', () => {
  it('is off when the switch is off, whatever the dates say', () => {
    expect(windowState({ market: 'dk', active: false, startDate: '2026-01-01' }, TODAY)).toBe('off');
    expect(windowState(undefined, TODAY)).toBe('off');
  });

  it('is live with no dates at all', () => {
    expect(windowState({ market: 'dk', active: true }, TODAY)).toBe('live');
  });

  it('runs through the whole of the finish day, then ends', () => {
    expect(windowState({ active: true, endDate: TODAY }, TODAY)).toBe('live');
    expect(windowState({ active: true, endDate: '2026-08-30' }, TODAY)).toBe('ended');
  });

  it('is scheduled before the start day and live on it', () => {
    expect(windowState({ active: true, startDate: '2026-09-01' }, TODAY)).toBe('scheduled');
    expect(windowState({ active: true, startDate: TODAY }, TODAY)).toBe('live');
  });

  it('ignores unusable dates rather than hiding the campaign', () => {
    expect(windowState({ active: true, startDate: 'soon' }, TODAY)).toBe('live');
  });

  it('accepts a full timestamp by taking its day', () => {
    expect(windowState({ active: true, endDate: '2026-08-31T23:59:00.000Z' }, TODAY)).toBe('live');
  });
});

describe('liveCampaigns', () => {
  const autumn = doc('Autumn', [
    { market: 'dk', active: true, startDate: '2026-08-01', endDate: '2026-09-30', placement: 'band', order: 2 },
    { market: 'de', active: false, placement: 'band', order: 1 },
    { market: 'fr', active: true, startDate: '2026-10-01', placement: 'band', order: 1 },
  ]);
  const guarantee = doc('Guarantee', [{ market: 'dk', active: true, placement: 'band', order: 1 }]);
  const local = doc('DK winter', [{ market: 'dk', active: true, placement: 'strip', order: 5 }]);
  const all = [autumn, guarantee, local];

  it('gives a market only the campaigns it switched on', () => {
    expect(liveCampaigns(all, 'dk', TODAY).map((c) => c.name)).toEqual(['Guarantee', 'Autumn', 'DK winter']);
    expect(liveCampaigns(all, 'de', TODAY)).toEqual([]);
    /* France has it scheduled, not live: nothing shows yet */
    expect(liveCampaigns(all, 'fr', TODAY)).toEqual([]);
  });

  it('never leaks a campaign to a market with no row of its own', () => {
    expect(liveCampaigns(all, 'be', TODAY)).toEqual([]);
    expect(liveCampaigns(all, 'int', TODAY)).toEqual([]);
  });

  it('orders by the running order, lowest first', () => {
    expect(liveCampaigns(all, 'dk', TODAY).map((c) => c.order)).toEqual([1, 2, 5]);
  });

  it('sorts a campaign with no running order last, not first', () => {
    const noOrder = doc('Unordered', [{ market: 'dk', active: true }]);
    expect(liveCampaigns([noOrder, guarantee], 'dk', TODAY).map((c) => c.name)).toEqual(['Guarantee', 'Unordered']);
  });

  it('splits the front-page slots, defaulting to the band', () => {
    const live = liveCampaigns(all, 'dk', TODAY);
    expect(bandCampaigns(live).map((c) => c.name)).toEqual(['Guarantee', 'Autumn']);
    expect(stripCampaigns(live).map((c) => c.name)).toEqual(['DK winter']);
    const noSlot = liveCampaigns([doc('Plain', [{ market: 'dk', active: true }])], 'dk', TODAY);
    expect(bandCampaigns(noSlot)).toHaveLength(1);
  });

  it('carries the window dates through, so the strip can print them', () => {
    const [, autumnLive] = liveCampaigns(all, 'dk', TODAY);
    expect(autumnLive.endDate).toBe('2026-09-30');
  });

  it('drops a campaign the day after it finishes, with no edit needed', () => {
    expect(liveCampaigns(all, 'dk', '2026-10-01').map((c) => c.name)).toEqual(['Guarantee', 'DK winter']);
  });

  it('survives documents with no activation table at all', () => {
    expect(liveCampaigns([{ _id: 'x', name: 'Empty' }], 'dk', TODAY)).toEqual([]);
  });
});

describe('helpers', () => {
  it('finds one market row', () => {
    const d = doc('X', [{ market: 'dk', active: true }, { market: 'de', active: false }]);
    expect(activationFor(d, 'de')?.active).toBe(false);
    expect(activationFor(d, 'be')).toBeUndefined();
  });

  it('isoToday is a plain YYYY-MM-DD day', () => {
    expect(isoToday(new Date('2026-08-31T22:15:00.000Z'))).toBe('2026-08-31');
  });
});
