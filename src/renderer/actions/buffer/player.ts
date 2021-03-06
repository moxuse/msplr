import { Dispatch } from 'redux';
import Effect from '../../model/Effect';
import { normalizeInt8Points } from '../helper';

export interface PlayerRequestPayload {
  isPlaying: boolean;
  bufnum: number;
  slice: { begin: number; end: number } | undefined;
  effect: Effect;
  error: Error | undefined;
}

export const playerRequest = (
  payload: PlayerRequestPayload,
) => ({
  type: 'PLAYER_REQUEST',
  payload: payload,
});

export const playerSuccess = (
  payload: PlayerRequestPayload,
) => ({
  type: 'PLAYER_SUCCESS',
  payload: payload,
});

export const playerFailure = (
  payload: PlayerRequestPayload,
) => ({
  type: 'PLAYER_FAILURE',
  payload: payload,
});

export type PlayerAction = (
  | ReturnType<typeof playerRequest>
  | ReturnType<typeof playerSuccess>
  | ReturnType<typeof playerFailure>
);

const removeEvents = () => {
  window.api.removeAllListeners('playerSuccess');
  window.api.removeAllListeners('playerFailure');
};

export const player = (mode: TableMode, bufnum: number, slice: ({ begin: number; end: number } | undefined), effect: Effect) => {
  return (dispatch: Dispatch<PlayerAction>) => {
    if (bufnum === 600) {
      return;
    }
    // console.log(effect.getPoints().length)
    dispatch(playerRequest({
      isPlaying: true,
      bufnum: bufnum,
      slice: slice,
      effect: effect,
      error: undefined,
    }));
    window.api.on!('playerSuccess', () => {
      dispatch(playerSuccess({
        isPlaying: false,
        bufnum: bufnum,
        slice: slice,
        effect: effect,
        error: undefined,
      }));
      removeEvents();
    });
    window.api.on!('playerFailure', (_, arg: Error) => {
      dispatch(playerFailure({
        isPlaying: false,
        bufnum: bufnum,
        slice: slice,
        effect: effect,
        error: arg,
      }));
      removeEvents();
    });
    switch (mode) {
      case 'normal':
        window.api.playerRequest(bufnum, slice, {
          rate: effect.getRate(),
          pan: effect.getPan(),
          gain: effect.getGain(),
          amp: effect.getAmp(),
        });
        break;
      case 'grain':
        window.api.grainPlayerRequest(bufnum, slice, {
          rate: effect.getRate(),
          pan: effect.getPan(),
          amp: effect.getAmp(),
          gain: effect.getGain(),
          points: normalizeInt8Points(effect.getPoints()),
          duration: effect.getDuration(),
          trig: effect.getTrig(),
          axisY: effect.getAxisY(),
        });
        break;
      default:
        break;
    }
  };
};
