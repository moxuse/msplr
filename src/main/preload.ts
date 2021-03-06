import { contextBridge, ipcRenderer } from 'electron';
/**
 * register ipc event APIs
 * */
contextBridge.exposeInMainWorld(
  'api', {
    loadSetting: async () => ipcRenderer.send('loadSetting'),
    loadWaveTableByDialog: async () => ipcRenderer.send('loadWaveTableByDialog'),
    loadWaveTable: async (filePath: string) => ipcRenderer.send('loadWaveTable', filePath),
    playerRequest: async (bufnum: number,
      slice: ({ begin: number; end: number } | undefined),
      effect: { amp: number; rate: number; pan: number; gain: number }) => ipcRenderer.send('playerRequest', bufnum, slice, effect),
    grainPlayerRequest: async (bufnum: number,
      slice: ({ begin: number; end: number } | undefined),
      effect: { amp: number; rate: number; pan: number; gain: number; points: Array<{ x: number; y: number }>; duration: number; trig: number; axisY: string }) => ipcRenderer.send('grainPlayerRequest', bufnum, slice, effect),
    allocBufferRequest: async (bufnum: number, filePath: string) => ipcRenderer.send('allocBufferRequest', bufnum, filePath),
    startRecordRequest: async (bufnum: number, writePath: string) => ipcRenderer.send('startRecordRequest', bufnum, writePath),
    stopRecordRequest: async (bufnum: number, writePath: string) => ipcRenderer.send('stopRecordRequest', bufnum, writePath),
    saveStore: async () => ipcRenderer.send('saveStore'),
    openStore: async () => ipcRenderer.send('openStore'),
    on: (channel: string, callback: any) => ipcRenderer.on(channel, (event, argv) => callback(event, argv)),
    once: (channel: string, callback: any) => ipcRenderer.once(channel, (event, argv) => callback(event, argv)),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
  },
);
