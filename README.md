# Goes Auto Parts Site

Landing page e catálogo público da Goes Auto Parts, em Angular standalone.

Veja as [notas de versão](RELEASE_NOTES.md) para as entregas em produção.

## Desenvolvimento

```bash
npm ci
npm start
```

Para produção, execute `npm run build`. Os arquivos ficam em `dist/site/browser`.

## Configuração

Edite `public/config.js` na implantação para definir:

- `apiBase`: URL pública da API do ERP, terminando em `/api/v1`;

Esses valores são configuração pública do site. Credenciais, tokens e chaves privadas nunca devem ser colocados nesse arquivo ou neste repositório.
