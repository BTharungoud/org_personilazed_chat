const nodeCrypto = require('node:crypto')

const getRandomValues = array => {
  if (array) {
    nodeCrypto.randomFillSync(array)
  }
  return array
}

if (typeof nodeCrypto.getRandomValues !== 'function') {
  nodeCrypto.getRandomValues = getRandomValues
}

if (typeof nodeCrypto.randomUUID !== 'function' && nodeCrypto.webcrypto?.randomUUID) {
  nodeCrypto.randomUUID = nodeCrypto.webcrypto.randomUUID.bind(nodeCrypto.webcrypto)
}

if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto = {
    getRandomValues,
    randomUUID:
      typeof nodeCrypto.randomUUID === 'function'
        ? nodeCrypto.randomUUID.bind(nodeCrypto)
        : undefined,
    subtle: nodeCrypto.webcrypto && nodeCrypto.webcrypto.subtle,
  }
}
