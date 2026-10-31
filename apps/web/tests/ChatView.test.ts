import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ChatView from '../src/views/ChatView.vue';
import { useChatStore } from '../src/stores/chat.store.js';
import { apiClient } from '../src/api/client.js';

describe('ChatView Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('renders empty chat welcome message and input area', () => {
    const wrapper = mount(ChatView, {
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.text()).toContain('How can I help you today?');
    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
    const sendButton = wrapper.find('button[type="submit"]');
    expect(sendButton.exists()).toBe(true);
  });

  it('submits a prompt, displays user turn, disables inputs during loading, and displays assistant turn upon completion', async () => {
    let resolveApi!: (val: { data: { success: true; data: { message: { role: 'model'; content: string } } } }) => void;
    const apiPromise = new Promise<{ data: { success: true; data: { message: { role: 'model'; content: string } } } }>((resolve) => {
      resolveApi = resolve;
    });

    vi.spyOn(apiClient, 'post').mockReturnValue(apiPromise as any);

    const wrapper = mount(ChatView, {
      global: {
        plugins: [createPinia()],
      },
    });

    const textarea = wrapper.find('textarea');
    const sendButton = wrapper.find('button[type="submit"]');

    await textarea.setValue('Hello AI');
    await wrapper.find('form').trigger('submit');

    // 1. Immediately user turn is visible in the feed
    expect(wrapper.text()).toContain('Hello AI');

    // 2. Inputs are disabled while loading
    expect((textarea.element as HTMLTextAreaElement).disabled).toBe(true);
    expect((sendButton.element as HTMLButtonElement).disabled).toBe(true);

    // 3. Resolve API at the network boundary
    resolveApi({
      data: {
        success: true,
        data: {
          message: {
            role: 'model',
            content: 'Assistant response text',
          },
        },
      },
    });

    await apiPromise;
    await flushPromises();

    // 4. Inputs re-enabled and cleared
    expect((textarea.element as HTMLTextAreaElement).disabled).toBe(false);
    expect((textarea.element as HTMLTextAreaElement).value).toBe('');

    // 5. Assistant turn is rendered
    expect(wrapper.text()).toContain('Assistant response text');
  });

  it('resets the visible conversation to the empty state when chat history is cleared', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        success: true,
        data: {
          message: {
            role: 'model',
            content: 'Assistant reply',
          },
        },
      },
    });

    const wrapper = mount(ChatView, {
      global: {
        plugins: [createPinia()],
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Hello');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Assistant reply');

    // Clear chat via store (as triggered by New Chat button in navbar)
    const chatStore = useChatStore();
    chatStore.clearChat();
    await flushPromises();

    expect(wrapper.text()).toContain('How can I help you today?');
    expect(wrapper.text()).not.toContain('Assistant reply');
  });

  it('displays the error banner without wiping user input buffer when API fails', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new Error('Network connection error')
    );

    const wrapper = mount(ChatView, {
      global: {
        plugins: [createPinia()],
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('My query that failed');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    // 1. Error banner is displayed
    const errorBanner = wrapper.find('[role="alert"]');
    expect(errorBanner.exists()).toBe(true);
    expect(errorBanner.text()).toContain('Network connection error');

    // 2. User's input buffer is NOT wiped
    expect((textarea.element as HTMLTextAreaElement).value).toBe('My query that failed');
  });
});
