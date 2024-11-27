# Comentários sobre o código

## 1. API_Codillo/index.js

Este arquivo contém a lógica principal para obter um token de acesso e consultar dados com base em um CNPJ. 

- **Importações**: O código começa importando as bibliotecas necessárias: `axios` para fazer requisições HTTP, `fs` para manipulação de arquivos e `qs` para serialização de dados.
  
- **Função getToken**: Esta função é responsável por obter um token de acesso. Ela utiliza o método `POST` para enviar as credenciais (ID e secret) para a URL de autenticação. Se a requisição for bem-sucedida, o token é retornado; caso contrário, um erro é registrado.

- **Função consultarEExportarDados**: Esta é a função principal que orquestra o fluxo de trabalho. Ela chama `getToken` para obter o token e, em seguida, consulta várias plataformas usando o CNPJ fornecido. Os resultados são salvos em um arquivo JSON.

- **Funções auxiliares**: O código contém várias funções auxiliares, como `consultarTodasPlataformasPorCNPJ`, `verificarStatusRequests`, e `listarPlataformas`, que ajudam a modularizar a lógica e a manter o código organizado.

- **Tratamento de erros**: O código implementa um sistema de tratamento de erros robusto, registrando erros em um array e gerando um relatório ao final.

## 2. API_Codillo/script.js

Este arquivo é semelhante ao `index.js`, mas foca em consultar dados com base em um arquivo JSON que contém CNJs e RequestIDs.

- **Função obterToken**: Semelhante à função `getToken` do `index.js`, mas com um tratamento de erro mais detalhado.

- **Função consultarPorId**: Esta função consulta diretamente um RequestID e retorna os dados correspondentes. Se ocorrer um erro, ele é tratado e um objeto de erro é retornado.

- **Função main**: A função principal que lê um arquivo JSON contendo CNJs e RequestIDs, obtém um token e processa cada CNJ. Os resultados são salvos em dois arquivos JSON: um para resultados bem-sucedidos e outro para processos pendentes.

- **Estrutura de dados**: O código utiliza objetos para armazenar resultados e processos pendentes, facilitando a manipulação e o salvamento dos dados.

## 3. API_Codillo/json_to_xlxs.js

Este arquivo é responsável por converter os dados de um arquivo JSON em planilhas Excel.

- **Importações**: O código importa as bibliotecas `XLSX` e `fs` para manipulação de arquivos e criação de planilhas.

- **Função criarPlanilha**: Esta função lê os dados de um arquivo JSON e os organiza em três categorias: covers, people e steps. Cada categoria é salva em uma planilha separada.

- **Tratamento de dados**: O código verifica se os dados são válidos antes de processá-los, registrando avisos quando os dados não estão no formato esperado.

- **Salvamento de arquivos**: Após processar os dados, o código salva cada categoria em um arquivo Excel separado, utilizando a biblioteca `XLSX`.

- **Tratamento de erros**: Assim como nos outros arquivos, o código implementa um tratamento de erros para garantir que qualquer problema durante a leitura ou escrita de arquivos seja registrado.

# Instructions for Use
1. Certifique-se de ter as dependências necessárias instaladas (axios, fs, qs, XLSX).
2. Execute o `index.js` para iniciar o processo de consulta e exportação de dados.
3. Após a execução, utilize o `json_to_xlxs.js` para converter os resultados em planilhas Excel.

# Project Files
- `index.js`: Contém a lógica para obter tokens e consultar dados.
- `script.js`: Foca na consulta de dados a partir de um arquivo JSON.
- `json_to_xlxs.js`: Converte dados JSON em planilhas Excel.

# Dependencies
- Axios: Para requisições HTTP.
- XLSX: Para manipulação de arquivos Excel.

# Functionality
O código permite consultar dados de processos judiciais com base em um CNPJ, armazenar os resultados em arquivos JSON e convertê-los em planilhas Excel para fácil visualização e análise.

# Note
Este código é um exemplo simplificado e deve ser adaptado para atender a requisitos de segurança e desempenho em um ambiente de produção.

## English Version

# Comments on the Code

## 1. API_Codillo/index.js

This file contains the main logic for obtaining an access token and querying data based on a CNPJ.

- **Imports**: The code starts by importing the necessary libraries: `axios` for making HTTP requests, `fs` for file manipulation, and `qs` for data serialization.

- **Function getToken**: This function is responsible for obtaining an access token. It uses the `POST` method to send credentials (ID and secret) to the authentication URL. If the request is successful, the token is returned; otherwise, an error is logged.

- **Function consultarEExportarDados**: This is the main function that orchestrates the workflow. It calls `getToken` to obtain the token and then queries various platforms using the provided CNPJ. The results are saved in a JSON file.

- **Auxiliary Functions**: The code contains several auxiliary functions, such as `consultarTodasPlataformasPorCNPJ`, `verificarStatusRequests`, and `listarPlataformas`, which help modularize the logic and keep the code organized.

- **Error Handling**: The code implements a robust error handling system, logging errors in an array and generating a report at the end.

## 2. API_Codillo/script.js

This file is similar to `index.js`, but focuses on querying data based on a JSON file containing CNJs and RequestIDs.

- **Function obterToken**: Similar to the `getToken` function in `index.js`, but with more detailed error handling.

- **Function consultarPorId**: This function directly queries a RequestID and returns the corresponding data. If an error occurs, it is handled, and an error object is returned.

- **Function main**: The main function that reads a JSON file containing CNJs and RequestIDs, obtains a token, and processes each CNJ. The results are saved in two JSON files: one for successful results and another for pending processes.

- **Data Structure**: The code uses objects to store results and pending processes, making it easier to manipulate and save the data.

## 3. API_Codillo/json_to_xlxs.js

This file is responsible for converting data from a JSON file into Excel spreadsheets.

- **Imports**: The code imports the `XLSX` and `fs` libraries for file manipulation and spreadsheet creation.

- **Function criarPlanilha**: This function reads data from a JSON file and organizes it into three categories: covers, people, and steps. Each category is saved in a separate spreadsheet.

- **Data Handling**: The code checks if the data is valid before processing it, logging warnings when the data is not in the expected format.

- **File Saving**: After processing the data, the code saves each category in a separate Excel file using the `XLSX` library.

- **Error Handling**: Like the other files, the code implements error handling to ensure that any issues during file reading or writing are logged.

# Instructions for Use
1. Ensure you have the necessary dependencies installed (axios, fs, qs, XLSX).
2. Run `index.js` to start the data querying and exporting process.
3. After execution, use `json_to_xlxs.js` to convert the results into Excel spreadsheets.

# Project Files
- `index.js`: Contains the logic for obtaining tokens and querying data.
- `script.js`: Focuses on querying data from a JSON file.
- `json_to_xlxs.js`: Converts JSON data into Excel spreadsheets.

# Dependencies
- Axios: For HTTP requests.
- XLSX: For Excel file manipulation.

# Functionality
The code allows querying judicial process data based on a CNPJ, storing the results in JSON files, and converting them into Excel spreadsheets for easy viewing and analysis.

# Note
This code is a simplified example and should be adapted to meet security and performance requirements in a production environment.
