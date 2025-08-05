import {
    Rect,
    RectProps,
    Txt,
    View2D,
} from '@motion-canvas/2d';
import {
    Color,
    createRef,
    Reference,
    easeInOutCubic,
    PossibleVector2,
    Vector2,
    all,
    DEFAULT,
} from '@motion-canvas/core';
import { PTxt } from './Ptxt';

export interface LvlProps extends RectProps {
    palette: { bg: string | Color; primary: string | Color };
    level: number;
    levelName: string;
    offset?: { x: number; y: number };
}

export class Lvl extends Rect {
    private numRef: Reference<Txt> = createRef<Txt>();
    private nameRef: Reference<Txt> = createRef<Txt>();

    public constructor(props: LvlProps) {
        super({
            fill: props.palette.bg,
            width: 200,     // start as a circle
            height: 200,
            stroke: new Color(props.palette.primary).lerp(props.palette.bg, 0.6),
            lineWidth: 5,
            radius: 1500,
            clip: true,
            shadowBlur: 10,
            shadowColor: "#0003",
            zIndex : 2,
            ...props
        });

        this.add(
            <>
                <PTxt
                    ref={this.numRef}
                    text={props.level.toString()}
                    fill={new Color(props.palette.primary).lerp(props.palette.bg, 0.2)}
                    fontSize={120}
                    fontWeight={600}
                />
                <PTxt
                    ref={this.nameRef}
                    text={props.levelName}
                    fill={new Color(props.palette.primary).lerp(props.palette.bg, 0.1)}
                    fontSize={60}
                    fontWeight={600}
                    x={-300}
                />
            </>,
        );
    }

    /** 
     * 1) position in top-left  
     * 2) expand from circle → rounded-rect  
     * 3) you can call setLevel after 
     */
    public *extendBadge(
        duration = 0.5,
        raw_offset: PossibleVector2 = { x: 40, y: 40 },
    ) {
        // 1. position it once, in the parent view
        const offset = new Vector2(raw_offset);
        const vp = this.parentAs<View2D>();
        yield* all(
            this.topLeft(
                vp.size().div([-2,-2]).add([offset.x, offset.y]), duration
            ),
            this.numRef().x(120, duration),
            this.fill(DEFAULT, .5),
            this.stroke(DEFAULT, .5),
            this.numRef().scale(.6, duration),
            this.nameRef().x(-40, duration),
            this.width(400, duration, easeInOutCubic),
            this.height(120, duration, easeInOutCubic),
            this.scale(0.7, duration, easeInOutCubic),
        )
    }

    /** Update both number and name */
    public setLevel(level: number, name: string) {
        this.numRef().text(level.toString());
        this.nameRef().text(name);
    }
}
