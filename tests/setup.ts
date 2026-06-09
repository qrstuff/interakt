class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  sessionStorage.clear();
  jest.restoreAllMocks();
});
