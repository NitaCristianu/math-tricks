import { Txt, TxtProps, initial, signal } from "@motion-canvas/2d";
import { all, easeInCubic, easeInOutCubic, easeOutCirc, easeOutCubic, PossibleColor, SignalValue } from "@motion-canvas/core";
import palette from "../../config/palette";

// POPPINS TEXT CLASS

export interface PTxtProps extends TxtProps {
  color?: SignalValue<PossibleColor>;
  hidden? : boolean,
}

export class PTxt extends Txt {
  public constructor(props?: PTxtProps) {
    super({
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: 64,
      fill: palette.text,
      shadowBlur: 8,
      shadowColor: palette.shadow, // subtle soft shadow
      ...props,
    });
    if (props.hidden){
      this.scale(0);
      this.opacity(0);
    }
  }

  *popin(d: number = .4, e = easeOutCubic) {
    yield* all(
      this.scale(1, d, e),
      this.opacity(1, d, e)
    )
  }
  
  *popout(d: number = .4, e = easeInCubic) {
    yield* all(
      this.scale(0, d, e),
      this.opacity(0, d, e)
    )
  }
}
