# Monitoramento de veículos



## Dependências

- Redis 3.0.504
- Mysql 15.1 Distrib 10.4.16-MariaDB
- Node.js 14.15.1

## Rodando o back-end localmente

1) Instale o Redis (redis-cli), Node.js e o Mysql

2) Crie o banco de dados
```mysql> create database monitoramento;```

3) Rode o migrations para criar os schemas e tabelas
```npx sequelize db:migrate```

Para o rollback, execute
```npx sequelize db:migrate:undo```

4) Gere uma chave para o JWT com o comando abaixo, e preencha a variável JWT_SECRET no arquivo .env

``` node -e "console.log(require('crypto').randomBytes(256).toString('base64'))" ```

5) Inicie o back-end
```npm start```
