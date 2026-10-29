// start offscreen work shortly before it becomes visible.
export function whenNearViewport(
  node: Element,
  callback: () => void
): () => void {
  const observer = new IntersectionObserver(
    entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    },
    { rootMargin: '600px' }
  );
  observer.observe(node);
  return () => observer.disconnect();
}
