import { loadContents, findProp, subscribeToConfig } from './findProp';

describe('loadContents', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        contents: {
          swe: [{ id: 'post-1', title: 'Remote post' }],
          music: [],
        },
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('notifies subscribers and updates config once remote contents are loaded', async () => {
    const notifications = [];
    const unsubscribe = subscribeToConfig(() => {
      notifications.push(findProp('contents.swe')?.length || 0);
    });

    await loadContents();

    expect(findProp('contents.swe')).toEqual([{ id: 'post-1', title: 'Remote post' }]);
    expect(notifications.length).toBeGreaterThan(0);

    unsubscribe();
  });
});
