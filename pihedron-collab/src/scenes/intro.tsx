import { Circle, Gradient, GradientStop, Img, Latex, makeScene2D, Node, Rect, View2D } from '@motion-canvas/2d';
import palette, { algebraPalette } from '../config/palette';
import { all, any, chain, Color, createRef, createRefArray, createSignal, delay, easeInCubic, easeInOutQuad, easeOutCubic, linear, loop, range, sequence, useRandom, waitFor, waitUntil } from '@motion-canvas/core';
import concrete_texture from '../images/coast_sand_05_diff_8k.png';
const equations = [
    "y = \\sin(x + \\alpha)",
    "f(x) = x^2 + \\alpha x + 1",
    "x^2 + y^2 = r^2",
    "\\alpha = \\frac{\\Delta y}{\\Delta x}",
    "y = e^{\\alpha x}",
    "\\int_{0}^{\\alpha} x^2 \\, dx",
    "\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}",
    "\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}",
    "\\frac{d}{dx} \\left( x^2 \\sin x \\right)",
    "y = \\log_{\\alpha}(x)",
    "\\lim_{x \\to \\infty} \\frac{1}{x} = 0",
    "\\det(A - \\lambda I) = 0",
    "x = r\\cos(\\theta),\\; y = r\\sin(\\theta)",
    "\\forall \\epsilon > 0,\\; \\exists \\delta > 0",
    "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}",
    "a_n = a_{n-1} + d",
    "f'(x) = \\lim_{h\\to0} \\frac{f(x+h)-f(x)}{h}",
    "\\oint_C \\vec{F} \\cdot d\\vec{r} = 0",
    "\\left( \\sum_{i=1}^{n} x_i^2 \\right)^{1/2}",
    "\\vec{a} \\times \\vec{b} = |a||b|\\sin\\"
];

const SPIRAL_AMMOUNT = 1; // SWTICH BACK TO 12 !!
function* spiralScrollEffect(view: Node) {
    const SPIRAL_INCREASE = createSignal(230);
    const SPIRAL_START = createSignal(200);
    const ACTVIATE_LATEX = createSignal(0);
    const texCount = 8;
    const generator = useRandom();

    const spirals = range(SPIRAL_AMMOUNT).map(i => {
        const stopCount = generator.nextInt(2, 3);
        const stops: GradientStop[] = [];

        for (let k = 0; k < stopCount; k++) {
            const offset = generator.nextFloat(0, 1);

            const isHighlight = generator.nextFloat() < .5;
            const baseColor = new Color([
                "#1e1e1e", "#2a2a2a", "#333333", "#3a3a3a", "#444444"
            ][generator.nextInt(0, 5)]);

            stops.push({ offset, color: baseColor });

            if (isHighlight) {
                const highlightColor = new Color(["#bbbbbb", "#eeeeee", "#ffcc88"][generator.nextInt(0, 3)]);
                const tinyOffset = offset + 0.005 + generator.nextFloat(0, 0.003); // ultra narrow highlight band

                // Add spike highlight right after base stop
                stops.push({ offset: Math.min(tinyOffset, 1), color: highlightColor });

                // Optional: fade back to base immediately
                const fadeOffset = tinyOffset + 0.005;
                if (fadeOffset < 1) {
                    stops.push({ offset: fadeOffset, color: baseColor });
                }
            }
        }

        // Ensure smooth loop
        stops.push({
            offset: 1,
            color: stops[0].color,
        });


        return (
            <Circle
                zIndex={SPIRAL_AMMOUNT - i}
                rotation={i * 90}
                size={() => SPIRAL_START() + i * SPIRAL_INCREASE()}
                fill={() => new Gradient({
                    type: 'conic',
                    from: 0,
                    to: SPIRAL_START() + i * SPIRAL_INCREASE(),
                    stops,
                })}
            >
                <Circle
                    size={() => SPIRAL_START() + i * SPIRAL_INCREASE()}
                    clip
                    layout
                    opacity={.3}
                >
                    <Img src={concrete_texture} size={'100%'} skew={[-4, 0]} />
                </Circle>
            </Circle>
        );
    });

    spirals.forEach(spiral => view.add(spiral));

    spirals.forEach((spiral, i) => {
        const radius = SPIRAL_START() - 50 + i * SPIRAL_INCREASE() * .5;
        const texCount = 7; // number of texes per circle

        for (let j = 0; j < texCount; j++) {
            const angle = (Math.PI * 2 * j) / texCount;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const saved_float = createSignal(generator.nextFloat(0.4, 0.9))

            const tex = (
                <Latex
                    tex={equations[Math.floor(generator.nextFloat(0, 1) * equations.length)]}
                    position={[x, y]}
                    fontSize={32}
                    rotation={(angle * 180) / Math.PI + 90 + generator.nextInt(-5, 5)}
                    zIndex={100 + i}
                    skew={[-generator.nextInt(-30, 30), 0]}
                    shadowBlur={() => ACTVIATE_LATEX() * 30}
                    shadowColor={"#ff9d00"}
                    opacity={() => Math.min(saved_float() + ACTVIATE_LATEX(), 1)}
                    fill={() =>
                        new Gradient({
                            type: 'linear',
                            from: [0, -20],
                            to: [0, 20],
                            stops: [
                                { offset: 0, color: new Color("#aaaaaa").lerp("#fff", ACTVIATE_LATEX()) },
                                { offset: 0.5, color: new Color("#ffffff") },
                                { offset: 1, color: new Color("#aaaaaa").lerp("#fff", ACTVIATE_LATEX()) },
                            ],
                        })
                    }
                />
            );
            spiral.add(tex);
        }
    });

    yield all(
        view.rotation(360, 7, linear),
    );
    yield* waitFor(1);
    yield any(
        view.scale(6.4, 3.2, linear),
        SPIRAL_INCREASE(40, 4, easeOutCubic),
        delay(.5, all(
            SPIRAL_START(100, 1.5), ACTVIATE_LATEX(1, .5)),
        ));
    yield* waitFor(0.5);
}

function parseSteps(chain: string[], stepIndex: number): string {
    return chain.slice(0, stepIndex + 1).join("  \\, ");
}

const chains: string[][] = [
    [
        "\\vec{F} = m \\vec{a}",
        "m = 2,\\; \\vec{a} = \\langle 3, 4 \\rangle",
        "\\vec{F} = 2 \\cdot \\langle 3, 4 \\rangle = \\langle 6, 8 \\rangle",
        "|\\vec{F}| = \\sqrt{6^2 + 8^2} = 10"
    ],
    [
        "s(t) = \\frac{1}{2}at^2 + v_0t + s_0",
        "a = 9.8,\\; v_0 = 0,\\; s_0 = 0",
        "s(t) = 4.9t^2",
        "v(t) = \\frac{ds}{dt} = 9.8t",
        "t = 3 \\Rightarrow s = 44.1,\\; v = 29.4"
    ],
    [
        "f(x) = x^2 + \\alpha x + 1",
        "\\alpha = \\frac{\\Delta y}{\\Delta x} = \\frac{6 - 2}{2 - (-1)} = \\frac{4}{3}",
        "f(x) = x^2 + \\frac{4}{3}x + 1",
        "f'(x) = 2x + \\frac{4}{3},\\; f''(x) = 2",
        "Critical point: f'(x) = 0 \\Rightarrow x = -\\frac{2}{3}"
    ],
    [
        "x = r\\cos(\\theta),\\; y = r\\sin(\\theta)",
        "r = 2,\\; \\theta = \\frac{\\pi}{3}",
        "x = 2\\cos(\\frac{\\pi}{3}) = 1,\\; y = 2\\sin(\\frac{\\pi}{3}) = \\sqrt{3}",
        "Convert to Cartesian: x^2 + y^2 = 4",
        "\\frac{dy}{dx} = \\frac{dy/d\\theta}{dx/d\\theta} = \\frac{r\\cos\\theta + r'\\sin\\theta}{-r\\sin\\theta + r'\\cos\\theta}"
    ],
    [
        "y = e^{\\alpha x}",
        "\\alpha = 2 \\Rightarrow y = e^{2x}",
        "\\frac{dy}{dx} = 2e^{2x}",
        "\\int_{0}^{1} e^{2x} \\, dx = \\frac{1}{2}e^{2x} \\Big|_0^1 = \\frac{1}{2}(e^2 - 1)",
        "Asymptotic behavior: \\lim_{x \\to -\\infty} y = 0"
    ]
];


function* LtxPath(container: Node) {
    const ltxs = createRefArray<Latex>();
    const ltx = createRef<Latex>();
    const all_ltxs: () => Latex[] = () => [...ltxs, ltx()];
    const generator = useRandom();
    const ltx_container = <Node>
        <>
            <Latex fontSize={24} tex={parseSteps(chains[0], 0)} y={-576} fill={'#ececec'} ref={ltxs} />
            <Latex fontSize={28} tex={parseSteps(chains[1], 0)} y={-432} fill={'#ececec'} ref={ltxs} />
            <Latex fontSize={34} tex={parseSteps(chains[2], 0)} y={-288} fill={'#ececec'} ref={ltxs} />
            <Latex fontSize={48} tex={parseSteps(chains[3], 0)} y={-144} fill={'#ececec'} ref={ltxs} />
            <Latex fontSize={100} tex={parseSteps(chains[4], 0)} y={0} fill={'#ececec'} ref={ltx} />
            <Latex fontSize={48} tex={parseSteps(chains[0], 0)} y={144} fill={'#ececec'} ref={ltxs} />
            <Latex fontSize={34} tex={parseSteps(chains[1], 0)} y={288} fill={'#ececec'} ref={ltxs} />
            <Latex fontSize={28} tex={parseSteps(chains[2], 0)} y={432} fill={'#ececec'} ref={ltxs} />
            <Latex fontSize={24} tex={parseSteps(chains[3], 0)} y={576} fill={'#ececec'} ref={ltxs} />
        </>

    </Node>
    const background = <Rect size={'100%'} fill={"#040404"}>
        {ltx_container}
    </Rect>
    const overlay = <Circle clip size={600} opacity={0}>{background}</Circle> as Circle;
    container.add(overlay);

    yield* chain(
        overlay.opacity(1, .3),
        overlay.size(3000, .3),
    );
    // movement
    ltx_container.x(-400);
    yield all(
        ltx_container.x(-900, 5),
    )
    yield* loop(5, (stepn) => all(...all_ltxs().map((ltx, i) => (ltx.tex(parseSteps(chains[i % chains.length], stepn), .5)))))

    yield* waitFor(4);

}

export default makeScene2D(function* (view) {
    view.fill('#040404');

    const spiral_cointainer = <Node />;
    view.add(spiral_cointainer);
    yield* spiralScrollEffect(spiral_cointainer);

    const latex_container = <Node />;
    view.add(latex_container);
    yield delay(.4, () => spiral_cointainer.remove());
    yield* LtxPath(latex_container);


});
