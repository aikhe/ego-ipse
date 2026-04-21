interface SplitOptions {
  /** 'vertical' clips bottom (chars move down), 'horizontal' clips left (chars move left) */
  clipDirection?: 'vertical' | 'horizontal';
}

export function splitTextCustom(element: HTMLElement, options: SplitOptions = {}) {
  const { clipDirection = 'vertical' } = options;
  // 1. Wrap words and characters
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeValue?.trim()) {
      textNodes.push(n as Text);
    }
  }

  textNodes.forEach((node) => {
    const text = node.nodeValue || '';
    const fragment = document.createDocumentFragment();

    const words = text.split(/(\s+)/);
    words.forEach((word) => {
      if (word.trim() === '') {
        fragment.appendChild(document.createTextNode(word));
      } else {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.verticalAlign = 'top';
        wordSpan.className = 'word';
        word.split('').forEach((char) => {
          const charSpan = document.createElement('span');
          charSpan.style.display = 'inline-block';
          charSpan.style.verticalAlign = 'top';
          charSpan.className = 'char';
          charSpan.textContent = char;
          if (clipDirection === 'horizontal') {
            // wrap char in its own overflow:hidden container
            const charWrap = document.createElement('span');
            charWrap.style.display = 'inline-block';
            charWrap.style.verticalAlign = 'top';
            charWrap.style.overflow = 'hidden';
            charWrap.className = 'char-mask';
            charWrap.appendChild(charSpan);
            wordSpan.appendChild(charWrap);
          } else {
            wordSpan.appendChild(charSpan);
          }
        });
        fragment.appendChild(wordSpan);
      }
    });
    node.parentNode?.replaceChild(fragment, node);
  });

  // 2. Group words into lines
  const words = Array.from(element.querySelectorAll('.word')) as HTMLElement[];
  let lastY = -1;
  const lines: HTMLElement[][] = [];
  let currentLine: HTMLElement[] = [];

  words.forEach((word) => {
    const y = word.offsetTop;
    if (lastY === -1 || Math.abs(y - lastY) > 5) {
      if (currentLine.length > 0) lines.push(currentLine);
      currentLine = [];
      lastY = y;
    }
    currentLine.push(word);
  });
  if (currentLine.length > 0) lines.push(currentLine);

  // 3. Build new DOM with line wrappers
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'flex-start';

  lines.forEach((lineWords, i) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';
    // clip-path: vertical clips bottom, horizontal clips left
    lineDiv.style.clipPath = clipDirection === 'horizontal'
      ? 'inset(0 0 0 0)'
      : 'inset(-100% 0 0 0)';
    lineDiv.style.display = 'block';
    lineDiv.style.whiteSpace = 'nowrap';
    lineDiv.style.position = 'relative';

    lineWords.forEach((word, j) => {
      // Preserve parent classes (like strong tags)
      let parent = word.parentElement;
      let classes = '';
      while (parent && parent !== element) {
        if (parent.className) classes += parent.className + ' ';
        // Preserve tag name for styling if needed
        if (parent.tagName === 'STRONG') classes += 'strong-tag ';
        parent = parent.parentElement;
      }
      if (classes) {
        word.className = `word ${classes.trim()}`;
        // If it was strong, make font bold manually in case CSS relied on tag
        if (classes.includes('strong-tag')) word.style.fontWeight = 'bold';
      }

      lineDiv.appendChild(word);

      // Add space after word if not end of line
      if (j < lineWords.length - 1) {
        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        lineDiv.appendChild(space);
      }
    });

    container.appendChild(lineDiv);
  });

  element.innerHTML = '';
  element.appendChild(container);
  
  return { lines: Array.from(container.querySelectorAll('.line')), chars: Array.from(container.querySelectorAll('.char')) };
}
