export function isEmpty(items?: unknown[]) {
  return items && items.length === 0
}

export function getEndPoint() {
  return import.meta.env.VITE_BASE_ENDPOINT as string
}

export function extractDomContent(
  originalNode: any,
  options: Record<string, unknown> = {}
) {
  const mainNode = originalNode.cloneNode(true)
  const allOriginalNodes = originalNode.querySelectorAll('*')
  const allClonedNodes = mainNode.querySelectorAll('*')

  // Apply computed styles as inline CSS for every node, as window.getComputedStyle isn't available outside the DOM
  for (let i = 0; i < allOriginalNodes.length; i++) {
    allClonedNodes[i].setAttribute(
      'style',
      window.getComputedStyle(allOriginalNodes[i]).cssText
    )
  }

  // Get rid of unwanted elements for copy text
  for (const unwantedNode of mainNode.querySelectorAll(
    'script, style, noscript, code'
  )) {
    unwantedNode.remove()
  }

  // Prevent <br> from causing stuck-together words
  for (const brNode of mainNode.querySelectorAll('br')) {
    brNode.outerHTML =
      brNode.nextSibling &&
      brNode.nextSibling.nodeValue &&
      brNode.nextSibling.nodeValue.trim().length
        ? ' '
        : '\n'
  }

  // Replace images with their alt text if they have one
  for (const imgNode of mainNode.querySelectorAll('img[alt]:not([alt=""])')) {
    imgNode.outerHTML = '\n' + imgNode.alt + '\n'
  }

  // Flex, block or grid display links with that only contain text can most likely be on their own line
  for (const linkNode of mainNode.querySelectorAll('a')) {
    const display = linkNode.style.display.toLowerCase()
    if (
      display == 'block' ||
      display.indexOf('flex') != -1 ||
      display.indexOf('grid') != -1
    ) {
      if (
        ![...linkNode.childNodes].filter(node => {
          return node.nodeName != '#text'
        }).length
      ) {
        linkNode.innerHTML = '\n\n' + linkNode.innerHTML
      }
    }
  }

  // Flex childs are rarely words forming a sentence: break them apart
  for (const node of mainNode.querySelectorAll('*')) {
    if (node.style.display.toLowerCase().indexOf('flex') != -1) {
      for (const child of node.children) {
        child.innerHTML = '\n\n' + child.innerHTML
      }
    }
  }

  // Simple fix for minified HTML
  mainNode.innerHTML = mainNode.innerHTML.replace(/></g, '> <')

  // Make sure headings are on their own lines - they should be "self-sufficient"
  mainNode.innerHTML = mainNode.innerHTML.replace(
    /<h([1-6])(.+?)<\/h\1>/g,
    '\n<h$1$2</h1>\n'
  )
  console.log(
    'innnerHTML',
    mainNode.innerHTML,
    mainNode.innerText,
    mainNode.textContent
  )

  // Home stretch...
  const rawContent = (mainNode.innerText || mainNode.textContent || '')
    .replace(/(\s{2,})([A-Z0-9])/g, '$1\n$2') // split blocks that seem to contain multiple sentences or standalone blocks
    .replace(/\s{3,}/g, '\n') // break everything into single line blocks
    .replace(/\n.{1,3}\n/g, '\n') // remove tiny words or tokens that are on their own
    .replace(/ {2,}/g, ' ') // replace multiple spaces by a single one
    .replace(/^\s(.+)$/gm, '$1') // remove spaces at the beginning of lines

  if (options.removeDuplicates || false) {
    // Get an array of strings without duplicates via the Set constructor and spread operator
    const contentStrings = [...new Set(rawContent.split('\n'))]

    if (options.returnAsArray || false) {
      return contentStrings
    }

    return contentStrings.join('\n')
  } else if (options.returnAsArray || false) {
    return rawContent.split('\n')
  }

  return rawContent
}
