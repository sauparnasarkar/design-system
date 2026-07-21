import type { Meta, StoryObj } from '@storybook/react-vite';

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'];
const HUES = [
  'brand',
  'gray',
  'blue',
  'darkblue',
  'lightblue',
  'teal',
  'emerald',
  'green',
  'moss',
  'lime',
  'yellow',
  'orange',
  'redorange',
  'red',
  'pink',
  'fuchsia',
  'purple',
];

function Ramp({ hue }: { hue: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="__s9cmpx-label2" style={{ width: 90 }}>{hue}</span>
      {SHADES.map((s) => (
        <div key={s} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 40,
              borderRadius: 3,
              border: '1px solid rgba(31,31,31,0.08)',
              background: `var(--__s9cmpx-color-${hue}-${s})`,
            }}
          />
          <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function Semantic({ names }: { names: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {names.map((n) => (
        <div key={n} style={{ width: 190 }}>
          <div
            style={{
              height: 40,
              borderRadius: 3,
              border: '1px solid rgba(31,31,31,0.08)',
              background: `var(--__s9cmpx-${n})`,
            }}
          />
          <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>--__s9cmpx-{n}</span>
        </div>
      ))}
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/Colors',
  parameters: { layout: 'padded' },
};
export default meta;

export const Palettes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p className="__s9cmpx-body3-long">
        Color ramps from the Syena Default theme. The <code>brand</code> ramp
        is what the Green and Blue themes override — switch themes in the toolbar.
      </p>
      {HUES.map((h) => (
        <Ramp key={h} hue={h} />
      ))}
    </div>
  ),
};

export const SemanticTokens: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 className="__s9cmpx-headline6">Interactive fill (primary)</h3>
        <Semantic
          names={[
            'interactive-fill-primary-default',
            'interactive-fill-primary-hover',
            'interactive-fill-primary-pressed',
            'interactive-fill-primary-disabled',
          ]}
        />
      </div>
      <div>
        <h3 className="__s9cmpx-headline6">Static text</h3>
        <Semantic
          names={[
            'static-text-standard',
            'static-text-strong',
            'static-text-weak',
            'static-text-sentiment-info',
            'static-text-sentiment-negative',
            'static-text-sentiment-notice',
            'static-text-sentiment-positive',
          ]}
        />
      </div>
      <div>
        <h3 className="__s9cmpx-headline6">Static background</h3>
        <Semantic
          names={[
            'static-background-standard',
            'static-background-weak',
            'static-background-strong',
            'static-background-sentiment-info',
            'static-background-sentiment-negative',
            'static-background-sentiment-notice',
            'static-background-sentiment-positive',
          ]}
        />
      </div>
    </div>
  ),
};
