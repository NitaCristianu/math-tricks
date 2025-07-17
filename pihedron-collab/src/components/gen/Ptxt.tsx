import {
  Txt,
  TxtProps,
  initial,
  signal,
} from '@motion-canvas/2d';
import {
  PossibleColor,
  SignalValue,
} from '@motion-canvas/core';
import palette from '../../config/palette';


// POPPINS TEXT CLASS

export interface PTxtProps extends TxtProps {
  color?: SignalValue<PossibleColor>;
}

export class PTxt extends Txt {
  public constructor(props?: PTxtProps) {
    super({
      fontFamily: 'Poppins',
      fontWeight: 500,
      fontSize: 64,
      fill: palette.text,
      shadowBlur: 8,
      shadowColor: palette.shadow, // subtle soft shadow
      ...props,
    });
  }
}
