import {test, expect} from '@playwright/test';
import path from 'path';
import {getStories, waitForStoryReady} from './utils';

const storybookDir = path.resolve(__dirname, '../apps/storybook/dist');
const stories = getStories(storybookDir);

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({page}) => {
    const url = `http://localhost:6006/iframe.html?id=${story.id}&viewMode=story`;
    await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});

    await waitForStoryReady(page);

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      `${story.title}/${story.name}.png`,
    );
  });
}
