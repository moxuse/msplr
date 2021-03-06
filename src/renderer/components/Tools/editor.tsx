import React, { useEffect, useRef, useState } from 'react';
import Table from '../../model/Table';
import Effect, { EffectKeys } from '../../model/Effect';
import TableList from '../../model/TableList';
import { Spec, PanSpec, RateSpec, GainSpec, DurSpec, TrigSpec } from '.';
import { connect } from 'react-redux';
import { updateWaveTableByEffect } from '../../actions/waveTables';
import styled from 'styled-components';

const ToolsArea = styled.div`
`;

const calcSpace = (val: number, add: number, key: string): number => {
  const clip = (value: number, add_: number, spec: Spec): number => {
    let value_ = value;
    // eslint-disable-next-line default-case
    switch (spec.type) {
      case 'linear':
        value_ += add_;
        break;
      case 'exp':
        value_ += (add * value_ + add_);
        break;
    }
    if (value_ < spec.min) { value_ = spec.min; }
    if (value_ > spec.max) { value_ = spec.max; }
    return value_;
  };
  let val_ = val;
  switch (key) {
    case 'rate':
      val_ = clip(val_, add, RateSpec);
      break;
    case 'pan':
      val_ = clip(val_, add, PanSpec);
      break;
    case 'gain':
      val_ = clip(val_, add, GainSpec);
      break;
    case 'duration':
      val_ = clip(val_, add, DurSpec);
      break;
    case 'trig':
      val_ = clip(val_, add, TrigSpec);
      break;
    default:
      break;
  }
  return val_;
};

const ToolsEditor = ({ children, tables, handleUpdate }: {
  children: JSX.Element; tables: TableList; handleUpdate: any;
}) => {
  const toolsEl = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [id, setId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  /**
   * tools edit with mouse event
   */
  const parseId = (id_: string): { id: string; type: string } | false => {
    const split = id_.split('-');
    if (id_ && split.length > 1) {
      return { id: split[0], type: split[1] };
    }
    return false;
  };

  const getEffect = (tables_: TableList, id_: string): Effect | undefined => {
    return TableList.getEffectById(tables_, id_);
  };

  useEffect(() => {
    const onMousedown = (e: MouseEvent) => {
      const target: HTMLElement = e.target as HTMLElement;
      const parsed = parseId(target.id);
      if (parsed) {
        setEditing(true);
        setId(parsed.id);
        setType(parsed.type);
      } else {
        setEditing(false);
      }
    };
    window.addEventListener('mousedown', onMousedown, false);
    return () => {
      window.removeEventListener('mousedown', onMousedown, false);
    };
  }, [tables, id, type, editing]);
  useEffect(() => {
    const onMousemove = (e: MouseEvent) => {
      if (editing && id && type) {
        const key: EffectKeys = type as EffectKeys;
        const eff = getEffect(tables, id);
        let val;
        if (eff && key) {
          val = eff.get(key);
          if (typeof val === 'number') {
            const newEffect = eff.set(key, calcSpace(val, e.movementY * -0.025, key));
            handleUpdate(tables, newEffect);
          }
        }
      }
    };
    window.addEventListener('mousemove', onMousemove, false);
    return () => {
      window.removeEventListener('mousemove', onMousemove, false);
    };
  }, [tables, id, type, editing]);
  useEffect(() => {
    const onMouseup = () => {
      setEditing(false);
      setId(undefined);
      setType(undefined);
    };
    window.addEventListener('mouseup', onMouseup, false);
    return () => {
      window.removeEventListener('mouseup', onMouseup, false);
    };
  }, [tables, id, type, editing]);

  return (
    <ToolsArea ref={toolsEl}>
      {children}
    </ToolsArea>
  );
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch: any) {
  return {
    handleUpdate: (table: Table, effect: Effect) => dispatch(updateWaveTableByEffect(table, effect)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ToolsEditor);

