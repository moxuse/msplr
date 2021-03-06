/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { loadSetting } from './setting';
// eslint-disable-next-line import/no-cycle
import { waveTables } from './waveTables';
import { allocReadBuffer } from './buffer';
import { player } from './buffer/player';
import { record } from './buffer/record';
import { midiAssign } from './midi';
import TableList from '../model/TableList';
import Table, { Slice } from '../model/Table';
import Sample from '../model/Sample';
import Effect from '../model/Effect';

const float32ArrayToBase64 = (f32: Float32Array) => {
  if (!f32) {
    return '';
  }
  const uint8 = new Uint8Array(f32.buffer);
  return btoa(uint8.reduce((data, byte) => {
    return data + String.fromCharCode(byte);
  }, ''));
};

const base64ToFloat32Array = (base64: string) => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  let i;
  for (i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
};

export const outboundTransform = (outboundState: any): any => {
  // console.log('outboundState', outboundState)
  let newTableList = new TableList();
  outboundState.waveTables.tables.forEach((t: Table) => {
    let table = new Table();
    table = table.set('id', t.id);
    table = table.set('mode', t.mode);
    table = table.set('name', t.name);
    table = table.set('sample', t.sample);
    table = table.set('effect', t.effect);
    table = table.set('bufnum', t.bufnum);
    table = table.set('slice', { begin: t.slice?.begin, end: t.slice?.end } as Slice);
    newTableList = TableList.appendTable(newTableList, table);
  });
  outboundState.waveTables.samples.forEach((s: Sample) => {
    let sample = new Sample();
    sample = sample.set('id', s.id);
    sample = sample.set('state', s.state);
    sample = sample.set('buffer', base64ToFloat32Array(s.buffer));
    sample = sample.set('filePath', s.filePath);
    newTableList = TableList.appendSample(newTableList, sample);
  });
  outboundState.waveTables.effects.forEach((e: Effect) => {
    let effect = new Effect();
    effect = effect.set('id', e.id);
    effect = effect.set('pan', e.pan);
    effect = effect.set('amp', e.amp);
    effect = effect.set('rate', e.rate);
    effect = effect.set('gain', e.gain);
    effect = effect.set('duration', e.duration);
    effect = effect.set('points', Object.values(e.points));
    effect = effect.set('trig', e.trig);
    effect = effect.set('axisY', e.axisY);
    newTableList = TableList.appendEffect(newTableList, effect);
  });

  const returnVal = {
    ...outboundState,
    tables: newTableList,
  };

  return returnVal;
};

const TransformTables = createTransform(
  (inboundState: any): any => {
    const returnVal = {
      ...inboundState,
      tables: '__TABLES__',
      waveTables: {
        tables: inboundState.tables ? inboundState.tables.getTables().toJS().map((t: Table) => {
          return {
            id: t.id,
            mode: t.mode,
            name: t.name,
            bufnum: t.bufnum,
            sample: t.sample,
            effect: t.effect,
            slice: { begin: t.slice?.begin, end: t.slice?.end },
          };
        }) : [],
        samples: inboundState.tables ? inboundState.tables.getSamples().toJS().map((s: Sample) => {
          return {
            id: s.id,
            state: s.state === 'ALLOCATED' ? 'NOT_ALLOCATED' : s.state,
            filePath: s.filePath,
            buffer: float32ArrayToBase64(s.buffer!),
          };
        }) : [],
        effects: inboundState.tables ? inboundState.tables.getEffects().toJS().map((e: Effect) => {
          // console.log('inbound points', e['points'])
          return {
            id: e.id,
            pan: e.pan,
            rate: e.rate,
            gain: e.gain,
            amp: e.amp,
            points: e.points,
            duration: e.duration,
            trig: e.trig,
            axisY: e.axisY,
          };
        }) : [],
      },
    };
    return returnVal;
  },
  outboundTransform, {
    whitelist: ['waveTables', 'tables'],
  },
);

const rootPersistConfig = {
  key: 'root',
  blacklist: ['player', 'record', 'allocReadBuffer', 'loadSetting', 'midiAssign'],
  whitelist: ['waveTables'],
  storage: storage,
  transforms: [TransformTables],
  throttle: 10,
  debug: true,
};

const rootReducer = combineReducers({
  loadSetting,
  waveTables,
  allocReadBuffer,
  player,
  record,
  midiAssign,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

console.log(import.meta.env);

const middleware = import.meta.env.DEV ? applyMiddleware(thunk, logger) : applyMiddleware(thunk);

export const configReducer = () => {
  const store = createStore(persistedReducer, composeWithDevTools(middleware));

  const persistor = persistStore(store);
  return { store: store, persistor: persistor };
};
