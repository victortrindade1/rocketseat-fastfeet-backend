# FastFeet - Backend

## P/ rodar:

1. Rode o banco Postgres: `yarn postgres`
2. Rode o banco Redis: `yarn redis`
3. Rode a fila de e-mails em paralelo: `yarn queue`
4. Rode o servidor: `yarn dev`

ou

Rode o postgres e redis e o servidor, sem rodar a queue: `yarn dev-start`

# Fazendo agora:

Talvez não exista rota/controller pra store de signature
Talvez não exista conexao da rota de store do avatar e pra qual deliveryman cadastrar
SOlução: na hora q eu salvo o avatar, eu tenho q fazer um update de deliveryman somente com avatar_id.
Assim como com signature. Qnd eu salvo signature, eu faço update de delivery somente com signature_id.

Na verdade, eu tenho q ficar calmo. Qnd eu fizer as páginas, tudo ficará mais claro.
Talvez dentro da página, terei já todos os dados tetificados, sem neuroses de ficar passando por POST
