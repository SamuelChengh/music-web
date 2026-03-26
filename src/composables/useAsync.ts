import { ref } from 'vue';

export function useAsync() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async <T>(fn: () => Promise<T>, errorMsg = '请求失败'): Promise<T | null> => {
    loading.value = true;
    error.value = null;
    try {
      const result = await fn();
      return result;
    } catch (e) {
      error.value = errorMsg;
      console.error(errorMsg, e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, execute };
}

export function useLoading(init = false) {
  const loading = ref(init);
  const start = () => loading.value = true;
  const stop = () => loading.value = false;
  const toggle = () => loading.value = !loading.value;
  return { loading, start, stop, toggle };
}