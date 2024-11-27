1. O arquivo `index.js` inicia a execução do programa, onde a função `consultarEExportarDados` é chamada com um CNPJ específico.
2. A função `consultarEExportarDados` chama `getToken` para obter um token de acesso necessário para autenticação nas APIs.
3. Em seguida, a função consulta todas as plataformas disponíveis para o CNPJ fornecido, coletando os IDs de requisição.
4. Após aguardar o processamento das consultas, a função verifica o status das requisições feitas.
5. A partir dos resultados obtidos, a função extrai os CNJs e faz novas consultas para cada um deles, coletando mais informações.
6. Os CNJs e seus respectivos IDs de requisição são salvos em um arquivo JSON chamado `cnjs_requestids.json`.
7. O arquivo `script.js` é responsável por ler o arquivo `cnjs_requestids.json` e consultar os dados correspondentes a cada CNJ.
8. A função `consultarPorId` dentro de `script.js` é chamada para obter os dados detalhados de cada CNJ usando o token de acesso.
9. Os resultados das consultas são armazenados em um objeto e, ao final, são salvos em um arquivo JSON chamado `resultados_por_cnj.json`.
10. O arquivo `json_to_xlxs.js` lê o arquivo `resultados_por_cnj.json` e transforma os dados em uma planilha Excel, organizando as informações em diferentes abas.



