# Como gerar os ícones PNG

Use o `icon.svg` como base para gerar os PNGs obrigatórios:

## Online (mais fácil)
1. Acesse https://realfavicongenerator.net
2. Faça upload do `icon.svg`
3. Baixe o pacote e copie `icon-192.png`, `icon-512.png` para esta pasta

## Via CLI (se tiver Node/npm)
```bash
npx sharp-cli resize 192 192 -- icon.svg -o icon-192.png
npx sharp-cli resize 512 512 -- icon.svg -o icon-512.png
cp icon-512.png icon-maskable.png
```

## Via Inkscape (desktop)
```bash
inkscape icon.svg -w 192 -h 192 -o icon-192.png
inkscape icon.svg -w 512 -h 512 -o icon-512.png
cp icon-512.png icon-maskable.png
```

Os três arquivos necessários são:
- `icon-192.png`
- `icon-512.png`  
- `icon-maskable.png`
