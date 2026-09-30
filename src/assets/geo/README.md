# Geometry for `Globe`

`world-countries-110m.topo.json` — country polygons for `Globe`, keyed by ISO 3166-1 alpha-3
`id` (plus Natural Earth's own codes for a few disputed territories).

**Provenance:** derived from Plotly's `world_110m` topology (`https://cdn.plot.ly/un/world_110m.json`,
which is what `SyChart`'s flat choropleth loads), itself built from Natural Earth 110m data
(public domain). Trimmed to the `countries` object only and re-quantized (1e4) with
`topojson-client` / `topojson-server` — 285 KB → ~146 KB. Same polygons and ids as the flat map,
so the globe and the flat map draw identical borders and join to data identically.

**Disputed zones:** Natural Earth's `XJK`, `XAC` and `XAP` (Jammu & Kashmir, Aksai Chin, Arunachal Pradesh) carry no
data of their own, so they are dissolved into `IND` (one merged MultiPolygon, no internal borders). The
topology was rebuilt with `topojson-client` `merge` + `topojson-server` (1e4 quantization).

**Known coverage:** 196 features; a few ids appear twice (`ESP`, `PRT`, `ECU`, `PSE` — multi-part
territories), which is harmless (both parts take the same value). Small states and dependencies
too small for 110m (e.g. Singapore, Bahrain, Malta, Maldives) have no polygon, exactly as on the
flat map.

Loaded at runtime via a `?url` import + `fetch` (not inlined into the JS bundle). Override with the
`geometry` / `geometryUrl` props.
