# Codex

## Prismic setup

I tipi personalizzati sono sincronizzati nella cartella `customtypes/`:

- `collection`: UID, titolo, descrizione breve, ordine e gruppo di relazioni verso i documenti `image_asset`.
- `image_asset`: UID, immagine, didascalia, crediti e ordine.

`sm.json` e `slicemachine.config.json` consentono la sincronizzazione con Slice Machine (`npx prismic sm --create-slice-machine`).

## Pipeline immagini

Usa [Sharp](https://sharp.pixelplumbing.com/) per generare asset responsive:

```bash
npm run build-images
```

Lo script scarica immagini da Prismic e crea varianti JPEG nelle directory `public/i/{collection}/w-{width}/`. Viene aggiornato anche il manifest JSON (`generated/image-manifest.json`) usato da `lib/images.ts` per esporre `srcSet`, `sizes`, hash e link `rel="preload"` dell'immagine successiva.

### Variabili d'ambiente

- `PRISMIC_REPOSITORY_NAME` o `PRISMIC_API_ENDPOINT`
- `PRISMIC_ACCESS_TOKEN` (opzionale per repository pubblici)

Lo script rimuove e rigenera il contenuto di `public/i/` ad ogni esecuzione.
