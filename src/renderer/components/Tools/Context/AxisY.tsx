import * as React from 'react';
import { AxisYType } from '../../../model/Effect';

export const AxisYContext = React.createContext<{
  axisY: AxisYType;
  setAxisY: (axisY: AxisYType) => void;
}>({
      axisY: 'rate',
      setAxisY: (axisY) => {
        console.log('axisY:', axisY);
      } });

export const AxisYContextProvider: React.FC<any> = ({ children, value }) => {
  const [axisY, setAxisY] = React.useState<AxisYType>(value);

  // 初期化処理
  React.useEffect(() => {
    setAxisY(value);
  }, []);

  return (
    <AxisYContext.Provider value={{ axisY: axisY, setAxisY: setAxisY }}>
      {children}
    </AxisYContext.Provider>
  );
};
