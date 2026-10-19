# Frontend Wajunkai

Frontend React 18 + TypeScript + Vite para o sistema de controle de estoque do Asilo Wajunkai.

## API

O frontend usa `https://wajunkai.onrender.com` por padrão na publicação. Para apontar a publicação para outra API, ajuste `VITE_API_URL` no ambiente de build.

Variáveis `VITE_*` são incluídas no bundle e podem ser visualizadas por qualquer pessoa que acesse o site. Não coloque senhas, tokens ou outros segredos nessas variáveis.

No desenvolvimento local, deixe `VITE_API_URL` indefinida para as chamadas `/v1` passarem pelo proxy do Vite. Se definir a variável localmente, as chamadas irão diretamente à origem configurada e dependerão do CORS dessa API.

Como o site e a API são origens diferentes em produção, configure o backend para permitir a origem pública do frontend e os métodos `GET`, `POST`, `PATCH` e `DELETE`, além dos cabeçalhos `Authorization`, `Content-Type` e `X-Usuario-Login`. Sem isso, o navegador bloqueia as chamadas autenticadas antes de elas chegarem à API.

## Lotes e validade

O Swagger documenta `dataValidade` (opcional, no formato `YYYY-MM-DD`) no corpo e na resposta de `POST /v1/movimentacao` e em `GET /v1/movimentacao`. O frontend envia esse campo nas entradas e exibe a validade devolvida pela API.

Como o Swagger não documenta campo nem endpoints de lote, o frontend permite informar o identificador usado pelo asilo ao registrar cada entrada e envia esse mesmo valor no campo `lote` das saídas. Se a API não devolver esse campo, o navegador guarda a associação entre o ID da movimentação e o lote informado; entradas do mesmo produto e lote são somadas, e saídas associadas são descontadas do saldo exibido. Essa associação fica apenas no navegador usado para registrar o movimento e não sincroniza entre dispositivos ou navegadores. Para persistência compartilhada, o backend precisa aceitar, armazenar e devolver `lote`. O estoque existente também precisará ser associado a lotes para ter validade controlada.

## Desenvolvimento

```sh
npm install
npm run dev
```

Para validar e preparar a publicação:

```sh
npx tsc --noEmit
npm run build
npm run preview
```

O login usa o campo `login` cadastrado na API, que não precisa ser um endereço de e-mail.
