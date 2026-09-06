# Willy Kilo packaged catalog

The repository seed catalog is intentionally small. The production catalog is designed to scale to millions of Open Food Facts records without putting millions of JSON files or records into the APK.

## Bulk import

Run the importer from a machine/worker with enough disk space:

```bash
OFF_MAX_PRODUCTS=500 npm run catalog:import
```

For the complete current dump:

```bash
npm run catalog:import
```

The importer streams the official JSONL gzip dump, validates/normalizes barcodes, keeps only nutrition/product fields needed by Willy, and writes deterministic sharded JSONL files plus `manifest.json`.

The default source is:
`https://static.openfoodfacts.org/data/openfoodfacts-products.jsonl.gz`

Open Food Facts publishes its data as open data under ODbL and provides JSONL/CSV/Parquet exports. The dataset is already multi-million scale, so the importer must remain streaming and must not load the whole dump into RAM.

## Runtime lookup chain

1. Willy local catalog/cache
2. server-side imported catalog shards
3. Open Food Facts barcode API
4. safe not-found response

Unknown products must never receive invented nutrition values.

## APK policy

Do **not** bundle the complete catalog into the APK. Mobile builds receive only a compact/high-value cache and use the server catalog for the full dataset. This keeps APK size and startup time bounded.
