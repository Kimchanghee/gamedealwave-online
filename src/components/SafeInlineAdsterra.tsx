type Props = {
  placement?: string;
  className?: string;
};

function pickSponsoredKey() {
  return (
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300_KEY ||
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY ||
    process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_KEY ||
    process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_KEY ||
    ''
  );
}

function buildSrcDoc(key: string, width: number, height: number) {
  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}body{display:grid;place-items:center;min-height:${height}px}#ad{width:${width}px;min-height:${height}px}</style></head><body><div id="ad"></div><script type="text/javascript">atOptions={'key':'${key}','format':'iframe','height':${height},'width':${width},'params':{}};<\/script><script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"><\/script></body></html>`;
}

export default function SafeInlineSponsored({ placement = 'inline', className = '' }: Props) {
  const key = pickSponsoredKey();
  if (!key) return null;
  const width = 300;
  const height = 250;

  return (
    <aside
      className={className || 'safe-inline-adsterra'}
      aria-label="Advertisement"
      data-placement={placement}
      style={{ maxWidth: 760, margin: '28px auto', padding: 12, border: '1px solid rgba(100,116,139,0.35)', borderRadius: 8, background: 'rgba(255,255,255,0.96)' }}
    >
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Advertisement</p>
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 250, overflow: 'hidden' }}>
        <iframe
          title={`safe-inline-adsterra-${placement}`}
          width={width}
          height={height}
          loading="eager"
          scrolling="no"
          srcDoc={buildSrcDoc(key, width, height)}
          style={{ border: 0, display: 'block', maxWidth: '100%' }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </aside>
  );
}
