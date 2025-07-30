import {
  CanvasStyle,
  Latex,
  LatexProps,
  Path,
} from '@motion-canvas/2d'
import {
  all,
  delay,
  easeInOutBack,
  easeInOutCubic,
  TimingFunction,
} from '@motion-canvas/core'

const factor = 2

export function math(tex: string) {
  return tex.replace(/\//g, '\\').split(' ');
}

export interface PitexProps extends LatexProps {}

export class Pitex extends Latex {
  color: CanvasStyle

  constructor(props: PitexProps) {
    super(props)

    this.color = this.fill()
  }

  getPaths() {
    return this.childAs(0)
      .children()
      .flatMap((part) =>
        part.children().length ? (part.children() as Path[]) : part
      ) as Path[]
  }

  *write(time: number = 0.33, timingFunction = easeInOutCubic) {
    const paths = this.getPaths()
    const duration = time / paths.length
    const animations = []

    for (let i = 0; i < this.getPaths().length; i++) {
      paths[i].fill(null).stroke(this.color).lineWidth(40).start(0).end(0)
      animations.push(
        delay(
          (i * duration) / factor,
          this.getPaths()[i].end(1, duration, timingFunction)
        ),
        delay(
          ((i + 1) * duration) / factor,
          this.getPaths()[i].fill(this.color, duration, timingFunction)
        ),
        delay(
          ((i + 1) * duration) / factor,
          this.getPaths()[i].lineWidth(0, duration, timingFunction)
        )
      )
    }

    yield* all(...animations)
  }

  *unwrite(time: number = 1, timingFunction = easeInOutCubic) {
    const paths = this.getPaths()
    const duration = time / paths.length
    const animations = []

    for (let i = 0; i < this.getPaths().length; i++) {
      paths[i].lineWidth(0).stroke(this.color).start(0)
      animations.push(
        delay(
          (i * duration) / factor,
          this.getPaths()[i].fill(null, duration, timingFunction)
        ),
        delay(
          (i * duration) / factor,
          this.getPaths()[i].lineWidth(40, duration, timingFunction)
        ),
        delay(
          ((i + 1) * duration) / factor,
          this.getPaths()[i].start(1, duration, timingFunction)
        )
      )
    }

    yield* all(...animations)
  }

  *edit(tex: string, time: number) {
    yield* this.tex(math(tex), time)
  }
}