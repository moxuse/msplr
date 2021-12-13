import * as ReduxPersistConstants from 'redux-persist/lib/constants';
import { LoadWaveTableByDialogAction } from "../actions/waveTables/byDialog";
import { LoadWaveTableAction } from "../actions/waveTables";

import TableList from "../model/TableList";

type ActionType = LoadWaveTableAction | LoadWaveTableByDialogAction

const tablesInitialState = {
  isFetching: false,
  tables: new TableList(),
  error: undefined,
}

export const waveTables = (state = tablesInitialState, action: ActionType) => {
  switch (action.type) {
    case 'LOAD_WAVE_TABLE_REQUEST':
      return {
        isFetching: action.payload.isFetching,
        tables: state.tables,
        error: state.error
      }
    case 'LOAD_WAVE_TABLE_SUCCESS':
      const newTableList = TableList.appendTable(state.tables, action.payload.table!);
      return {
        isFetching: action.payload.isFetching,
        tables: TableList.appendSample(newTableList, action.payload.sample!),
        error: state.error
      }
    case 'LOAD_WAVE_TABLE_FAILURE':
      return {
        isFetching: action.payload.isFetching,
        tables: state.tables,
        error: action.payload.error
      }
    case 'LOAD_WAVE_TABLE_BY_DIALOG_REQUEST':
      return {
        isFetching: action.payload.isFetching,
        tables: state.tables,
        error: state.error
      }
    case 'LOAD_WAVE_TABLE_BY_DIALOG_SUCCESS':
      const newTable = TableList.appendTable(state.tables, action.payload.table!);
      return {
        isFetching: action.payload.isFetching,
        tables: TableList.appendSample(newTable, action.payload.sample!),
        error: state.error
      }
    case 'LOAD_WAVE_TABLE_BY_DIALOG_FAILURE':
      return {
        isFetching: action.payload.isFetching,
        tables: state.tables,
        error: action.payload.error
      }
    case ReduxPersistConstants.PERSIST:
      console.log('on PERSIST', state, action);
      return state;
    default:
      return state;
  }
}