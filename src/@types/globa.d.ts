import { IpcMainEvent } from 'electron';
import { AudioData } from 'wav-decoder';
import Table from '../view/model/Table';
import TableList from '../view/model/TableList';

declare global {
  interface Window {
    api: ContextBridge;
  }

  type IcpEventArg =
    AudioData &
    { tables: Table } &
    { filePath: string, audioData: AudioData } &
    { tables: Table[] } &
    Error;
  
  type IpcEvent = ((e: IpcMainEvent, arg: IcpEventArg) => void) | undefined;

  interface ContextBridge {
    settings: any,
    loadStore: () => void,
    loadWaveTableByDialog: () => void,
    loadWaveTable: (filePath: string) => void,
    on: (channel: string, callback: IpcEvent) => void;
    removeAllListeners: (channel: string) => void;
  }
}


