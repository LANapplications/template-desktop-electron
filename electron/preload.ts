import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Auth0: puente seguro hacia el proceso main ---------
// El renderer solo dispara acciones; los tokens nunca cruzan este puente.
contextBridge.exposeInMainWorld('auth', {
  login: () => ipcRenderer.invoke('auth:login'),
  register: () => ipcRenderer.invoke('auth:register'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getUser: () => ipcRenderer.invoke('auth:getUser'),
  isAuthenticated: () => ipcRenderer.invoke('auth:isAuthenticated'),
})
