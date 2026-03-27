import { describe, expect, it } from 'vitest';
import { parsePumpLiveEntries } from '../src/lib/pumpfun';

describe('parsePumpLiveEntries', () => {
  it('parses escaped live entries from Pump.fun live HTML payloads', () => {
    const html = `
      <script>
        window.__STATE__ = {"initialSectionData":[[
          {\\"id\\":\\"foo\\",\\"mint\\":\\"MintOne\\",\\"coinCreatedTimestamp\\":1,\\"title\\":\\"First Token\\",\\"creator\\":{\\"address\\":\\"CreatorOne\\"},\\"isLive\\":true,\\"playlistUrl\\":\\"https://clips.example/one.m3u8\\",\\"viewerCount\\":12,\\"linkUrl\\":\\"/coin/MintOne\\",\\"symbol\\":\\"ONE\\"},
          {\\"id\\":\\"bar\\",\\"mint\\":\\"MintTwo\\",\\"coinCreatedTimestamp\\":2,\\"title\\":\\"Second Token\\",\\"creator\\":{\\"address\\":\\"CreatorTwo\\"},\\"isLive\\":true,\\"playlistUrl\\":\\"https://clips.example/two.m3u8\\",\\"viewerCount\\":5,\\"linkUrl\\":\\"/coin/MintTwo\\",\\"symbol\\":\\"TWO\\"}
        ]]};
      </script>
    `;

    expect(parsePumpLiveEntries(html)).toEqual([
      {
        mint: 'MintOne',
        creatorAddress: 'CreatorOne',
        viewerCount: 12,
        linkUrl: '/coin/MintOne',
        symbol: 'ONE',
        title: 'First Token',
        isLive: true,
      },
      {
        mint: 'MintTwo',
        creatorAddress: 'CreatorTwo',
        viewerCount: 5,
        linkUrl: '/coin/MintTwo',
        symbol: 'TWO',
        title: 'Second Token',
        isLive: true,
      },
    ]);
  });
});
