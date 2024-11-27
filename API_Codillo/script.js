const axios = require('axios');
const qs = require('qs');
const fs = require('fs');

// Função para obter o token de acesso
async function obterToken() {
    const data = qs.stringify({
        grant_type: 'client_credentials',
        id: 'Coloque seu ID', 
        secret: 'coloque SEU Secret' 
    });

    const config = {
        method: 'post',
        url: 'https://auth.codilo.com.br/oauth/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: dados
    };

    try {
        const resposta = await axios(config);
        console.log('Token de acesso obtido com sucesso.');
        return resposta.data.access_token;
    } catch (erro) {
        console.error('Erro ao obter token:', erro.response ? erro.response.data : erro.message);
        throw new Error('Falha na obtenção do token.');
    }
}

// Função para consultar diretamente pelo requestId
async function consultarPorId(requestId, token) {
    const config = {
        method: 'get',
        url: `https://api.capturaweb.com.br/v1/request/${requestId}`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
        }
    };

    try {
        const resposta = await axios(config);
        return resposta.data;
    } catch (erro) {
        console.error(`Erro na consulta do requestId (${requestId}):`, erro.response ? erro.response.data : erro.message);
        return { success: false, requestId, error: erro.message };
    }
}

// Função principal para integrar todas as etapas
async function main() {
    try {
        // Lê o arquivo de CNJs e RequestIDs
        const cnjsData = JSON.parse(fs.readFileSync('cnjs_requestids.json', 'utf8'));
        const token = await obterToken();

        // Objeto para armazenar resultados por CNJ
        const resultadosPorCNJ = {};
        // Objeto para armazenar processos com status diferente de success
        const processosPendentes = {};

        // Processa cada CNJ e seu RequestID
        for (const [cnj, requestId] of Object.entries(cnjsData.cnjs)) {
            console.log(`Consultando CNJ ${cnj} com requestId: ${requestId}...`);
            
            const dados = await consultarPorId(requestId, token);

            // Se o status for pending ou não for success, armazena no objeto de pendentes
            if (dados.requested?.status !== 'success') {
                console.log(`Armazenando CNJ ${cnj} - status: ${dados.requested?.status}`);
                processosPendentes[cnj] = { requestId: requestId };
                continue;
            }

            // Armazena o resultado no objeto, usando o CNJ como chave
            resultadosPorCNJ[cnj] = {
                requestId: requestId,
                dados: dados
            };
        }

        // Salva todos os resultados em um único arquivo
        fs.writeFileSync(
            'resultados_por_cnj.json', 
            JSON.stringify(resultadosPorCNJ, null, 2)
        );

        // Salva os processos pendentes em um arquivo separado
        fs.writeFileSync(
            'processos_pendentes.json',
            JSON.stringify(processosPendentes, null, 2)
        );

        console.log('Processo concluído. Resultados salvos em resultados_por_cnj.json e processos pendentes em processos_pendentes.json');
    } catch (erro) {
        console.error('Erro no processo:', erro.message);
    }
}

main();
