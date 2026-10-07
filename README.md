# Frontend Wajunkai

## API

O front usa `https://wajunkai.onrender.com` por padrão. Para apontar para outra API, defina `VITE_API_URL` no ambiente de build do Vite.

No desenvolvimento local, as chamadas `/v1` passam pelo proxy do Vite. Isso evita bloqueio de CORS durante o desenvolvimento; não substitui a configuração de CORS no backend publicado.

Como o site e a API são origens diferentes em produção, configure o backend para permitir a origem pública do frontend e os métodos `GET`, `POST`, `PATCH` e `DELETE`, além dos cabeçalhos `Authorization`, `Content-Type` e `X-Usuario-Login`. Sem isso, o navegador bloqueia as chamadas autenticadas antes de elas chegarem à API.

## Desenvolvimento

```sh
npm install
npm run dev
```

O login usa o campo `login` cadastrado na API, não necessariamente um endereço de e-mail.
