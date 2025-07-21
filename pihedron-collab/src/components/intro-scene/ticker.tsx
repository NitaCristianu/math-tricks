// NumberTicker.tsx
import {
  Node,
  Rect,
  Layout,
  Txt,
  signal,
  initial,
  NodeProps,
  Latex,
} from "@motion-canvas/2d";
import {
  createRef,
  createSignal,
  delay,
  SignalValue,
  SimpleSignal,
} from "@motion-canvas/core";

export interface NumberTickerProps extends NodeProps {
  maxValue?: SignalValue<number>;
  tickSize?: SignalValue<number>;
  width?: SignalValue<number>;
  height?: SignalValue<number>;
  tickDuration?: SignalValue<number>;
  decimal?: SignalValue<boolean>;
  endSymbol?: SignalValue<string>;
}

export class NumberTicker extends Node {
  public readonly layout = createRef<Layout>();
  public readonly showInf = createSignal(0);

  @initial(100)
  @signal()
  public declare readonly maxValue: SimpleSignal<number, this>;

  @initial(24)
  @signal()
  public declare readonly tickSize: SimpleSignal<number, this>;

  @initial(200)
  @signal()
  public declare readonly width: SimpleSignal<number, this>;

  @initial(25)
  @signal()
  public declare readonly height: SimpleSignal<number, this>;

  @initial(2)
  @signal()
  public declare readonly tickDuration: SimpleSignal<number, this>;

  @initial("\\infty")
  @signal()
  public declare readonly endSymbol: SimpleSignal<string, this>;

  @initial(false)
  @signal()
  public declare readonly decimal: SimpleSignal<boolean, this>;

  public *tick() {
    yield delay(this.tickDuration() - 1, this.showInf(1, 0.5));
    yield* this.layout().y(this.layout().y() - 2122, this.tickDuration());
  }

  public constructor(props?: NumberTickerProps) {
    super({ zIndex: 3, ...props });
    const nums = this.decimal()
      ? Array.from(
          { length: Math.floor(this.maxValue() * 100) + 1 },
          (_, i) => i * 0.01
        )
      : Array.from({ length: this.maxValue() + 1 }, (_, i) => i);

    this.add(
      <Rect width={this.width} height={this.height} clip>
        <Latex
          fill={"white"}
          tex={this.endSymbol}
          x={-5}
          fontSize={() => this.tickSize()}
          opacity={this.showInf}
          y={() => (1 - this.showInf()) * 50}
          shadowBlur={3}
          shadowColor={"#fffa"}
        />
        <Layout
          direction="column"
          y={() => this.layout().height() / 2 - 10}
          ref={this.layout}
          layout
          gap={4}
        >
          {nums.map((n) => (
            <Latex
              fill={"white"}
              tex={() => (this.decimal() ? n.toFixed(2) : (n + 3).toFixed(0))}
              fontSize={() => this.tickSize()}
              shadowBlur={3}
              opacity={() => 1 - this.showInf()}
              shadowColor={"#fffa"}
            />
          ))}
        </Layout>
      </Rect>
    );
  }
}
