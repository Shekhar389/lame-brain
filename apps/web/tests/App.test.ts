import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../src/App.vue';
import { router } from '../src/router/index.js';
import { createPinia } from 'pinia';

describe('Vue App Component', () => {
  it('renders navbar and main layout', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
      },
    });

    expect(wrapper.text()).toContain('lame-brain');
    expect(wrapper.text()).toContain('New Chat');
  });
});
