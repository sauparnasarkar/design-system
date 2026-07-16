import type { Meta, StoryObj } from '@storybook/react-vite';

const STYLES = [
  'display1',
  'display2',
  'headline1',
  'headline2',
  'headline3',
  'headline4',
  'headline5',
  'headline6',
  'headline7',
  'headline8',
  'body1',
  'body2',
  'body3-long',
  'body3-short',
  'body4',
  'label1',
  'label2',
  'label3',
];

const meta: Meta = {
  title: 'Tokens/Typography',
  parameters: { layout: 'padded' },
};
export default meta;

export const Scale: StoryObj = {
  render: () => (
    <table style={{ borderCollapse: 'collapse' }}>
      <tbody>
        {STYLES.map((s) => (
          <tr key={s} style={{ borderBottom: '1px solid rgba(31,31,31,0.08)' }}>
            <td className="sy-label3" style={{ padding: '12px 24px 12px 0', color: 'var(--sy-static-text-weak)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
              sy-{s}
            </td>
            <td style={{ padding: '12px 0' }}>
              <span className={`sy-${s}`}>The quick brown fox jumps over the lazy dog</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
