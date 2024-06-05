export const LOCALE_STORAGE_KEY = 'snw-generator:inventory'

const handler = {
  deleteProperty(target, property) {
    if (property in target) {
      delete target[property]
      saveToLocalStorage(target)

      return true
    }

    return false
  },
  set(target, property, value) {
    target[property] = value
    console.log('Property', property, 'set to', value) // For demonstration
    saveToLocalStorage(target)

    return true
  },
}

const isProxiedSymbol = Symbol('isProxied') // Unique Symbol to mark proxied objects

export const recursiveProxy = (obj, handler) => {
  // Function to check if the object is already a proxy
  const isProxied = (obj) => {
    return !!obj[isProxiedSymbol]
  }

  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object' && !isProxied(obj[key])) {
      obj[key] = recursiveProxy(obj[key], handler) // Recursively proxy nested objects
    }
  })

  if (!isProxied(obj)) {
    const proxy = new Proxy(obj, handler)
    proxy[isProxiedSymbol] = true // Mark the proxy to avoid re-proxying

    return proxy
  }

  return obj
}

export const saveToLocalStorage = (data) => {
  localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(data))
}

export const serializeProxy = (obj) => {
  return recursiveProxy(obj, handler)
}

// TODO convert state fns into service
{
  const objectWithMethods = {
    methodA() {
      console.log('Executing methodA')
    },
    methodB() {
      console.log('Executing methodB')
    },
  }

  const handler = {
    get(target, prop, receiver) {
      const origMethod = target[prop]
      if (typeof origMethod === 'function') {
        return function (...args) {
          console.log(`Calling ${prop} with arguments:`, args)

          return origMethod.apply(this, args) // Ensure 'this' context is correct
        }
      }

      return origMethod
    },
  }

  const proxiedObject = new Proxy(objectWithMethods, handler)
}
