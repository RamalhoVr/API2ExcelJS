const axios = require('axios');
const fs = require('fs');
const qs = require('qs');

// Função para obter o token de acesso
async function getToken() {
    const data = qs.stringify({
        grant_type: 'client_credentials',
        id: 'Coloque seu ID', 
        secret: 'coloque SEU Secret' 
    });

    try {
        const response = await axios.post('https://auth.codilo.com.br/oauth/token', data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.access_token; // Retorna o token de acesso
    } catch (error) {
        console.error('Erro ao obter o token:', error.response ? error.response.data : error.message);
        throw error; // Lança o erro para ser tratado em outro lugar
    }
}

// Função principal para consultar e exportar dados
async function consultarEExportarDados(cnpj) {
    const token = await getToken(); // Obtém o token de acesso
    const erros = [];

    // Primeira etapa: Consulta por CNPJ
    console.log('Iniciando consulta por CNPJ...');
    const requestIdsCNPJ = await consultarTodasPlataformasPorCNPJ(cnpj, token, erros);
    
    // Aguarda processamento
    console.log('Aguardando processamento das consultas por CNPJ...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Coleta dados das consultas por CNPJ
    const dadosCNPJ = await verificarStatusRequests(requestIdsCNPJ, token, erros);
    
    // Extrai CNJs dos resultados e faz nova consulta para cada CNJ
    const cnjsComRequestIds = {};
    
    for (const resultado of dadosCNPJ) {
        if (resultado.data && Array.isArray(resultado.data)) {
            for (const processo of resultado.data) {
                if (processo.properties && processo.properties.cnj) {
                    const cnj = processo.properties.cnj;
                    const platform = processo.platform;
                    const tribunal = processo.tribunal;
                    
                    try {
                        const response = await axios.post(
                            'https://api.capturaweb.com.br/v1/request',
                            {
                                source: 'courts',
                                platform: platform,
                                search: tribunal,
                                query: 'principal',
                                param: {
                                    key: 'cnj',
                                    value: cnj
                                }
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (response.data.success) {
                            cnjsComRequestIds[cnj] = response.data.data.id; // Armazena o ID da requisição
                            console.log(`CNJ ${cnj} consultado com sucesso. RequestId: ${response.data.data.id}`);
                        }
                    } catch (error) {
                        const erroMsg = `Erro ao consultar CNJ ${cnj}: ${error.response ? JSON.stringify(error.response.data) : error.message}`;
                        console.error(erroMsg);
                        erros.push({ type: 'Consulta CNJ', message: erroMsg }); // Adiciona erro ao relatório
                    }
                }
            }
        }
    }

    // Salva os CNJs e seus requestIds em um arquivo JSON
    fs.writeFileSync('cnjs_requestids.json', JSON.stringify({
        total_cnjs: Object.keys(cnjsComRequestIds).length,
        cnpj: cnpj,
        cnjs: cnjsComRequestIds
    }, null, 2), 'utf-8');
    console.log('CNJs e seus requestIds salvos em cnjs_requestids.json');

    // Gera relatório de erros
    gerarRelatorioDeErros(erros);
}

// Função para consultar todas as plataformas disponíveis por CNPJ
async function consultarTodasPlataformasPorCNPJ(cnpj, token, erros) {
    const plataformas = await listarPlataformas(token, erros); // Lista as plataformas disponíveis
    const requestIds = [];

    const plataformasPermitidas = {
        'clickjud': ['tjmt', 'tjpe', 'trf1', 'trf4', 'trf4-jfpr', 'trf4-jfrs', 'trf4-jfsc', 'trf5'],
        'creta': ['tjmt', 'tjpe', 'trf1', 'trf4', 'trf4-jfpr', 'trf4-jfrs', 'trf4-jfsc', 'trf5'],
        'custom': ['tjmt', 'tjpe', 'trf1', 'trf4', 'trf4-jfpr', 'trf4-jfrs', 'trf4-jfsc', 'trf5'],
        'eproc': ['tjmt', 'tjpe', 'trf1', 'trf4', 'trf4-jfpr', 'trf4-jfrs', 'trf4-jfsc', 'trf5'],
        'esaj': ['tjmt', 'tjpe', 'trf1', 'trf4', 'trf4-jfpr', 'trf4-jfrs', 'trf4-jfsc', 'trf5'],
        'pje': ['tjap', 'tjba', 'tjce', 'tjdft', 'tjes', 'tjma', 'tjmg', 'tjmt', 'tjpb', 'tjpe', 'tjrj', 'tjrn', 'tjro', 'tjrr'],
        'pje-jf': ['tjmt', 'tjpe', 'trf1', 'trf4', 'trf4-jfpr', 'trf4-jfrs', 'trf4-jfsc', 'trf5'],
        'projudi': ['tjam', 'tjba', 'tjdft', 'tjes', 'tjgo', 'tjmg', 'tjpa', 'tjpe', 'tjpr', 'tjrj', 'tjrr'],
        'superiores': ['cnj'],
        'tucujuris': ['tjmt', 'tjpe', 'trf1', 'trf4', 'trf4-jfpr', 'trf4-jfrs', 'trf4-jfsc', 'trf5']
    };

    for (const plataforma of plataformas) {
        const platformName = plataforma.platform;
        
        if (!plataformasPermitidas[platformName]) {
            continue; // Ignora plataformas não permitidas
        }

        for (const tribunal of plataforma.searches) {
            const searchName = tribunal.search;

            if (!plataformasPermitidas[platformName].includes(searchName)) {
                continue; // Ignora tribunais não permitidos
            }

            for (const query of tribunal.queries) {
                try {
                    const response = await axios.post(
                        'https://api.capturaweb.com.br/v1/request',
                        {
                            source: 'courts',
                            platform: platformName,
                            search: searchName,
                            query: query.query,
                            param: {
                                key: 'doc',
                                value: cnpj
                            }
                        },
                        {
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                        }
                    );

                    if (response.data.success) {
                        const requestId = response.data.data.id; // Armazena o ID da requisição
                        console.log(`Consulta inicial bem-sucedida. Plataforma: ${platformName}, Tribunal: ${searchName}, Consulta: ${query.query}, requestId: ${requestId}`);
                        requestIds.push({
                            requestId: requestId,
                            platform: platformName,
                            tribunal: searchName,
                            query: query.query
                        });
                    }
                } catch (error) {
                    const erroMsg = `Erro ao consultar plataforma ${platformName}, tribunal ${searchName}, consulta ${query.query}: ${error.response ? JSON.stringify(error.response.data) : error.message}`;
                    console.error(erroMsg);
                    erros.push({ type: 'Consulta', message: erroMsg }); // Adiciona erro ao relatório
                }
            }
        }
    }

    return requestIds; // Retorna os IDs das requisições
}

// Função para verificar o status das requisições
async function verificarStatusRequests(requestIds, token, erros) {
    const resultados = [];

    for (const requestInfo of requestIds) {
        try {
            const response = await axios.get(`https://api.capturaweb.com.br/v1/request/${requestInfo.requestId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'accept': '*/*' }
            });

            if (response.data.success && response.data.data) {
                const dadosProcessados = response.data.data.map(item => ({
                    ...item,
                    platform: requestInfo.platform,
                    tribunal: requestInfo.tribunal
                }));

                resultados.push({
                    success: response.data.success,
                    type: response.data.type,
                    requested: response.data.requested,
                    info: response.data.info,
                    data: dadosProcessados
                });
                console.log(`Consulta finalizada para requestId ${requestInfo.requestId}`);
            } else {
                const erroMsg = `Status pendente ou formato inesperado para requestId ${requestInfo.requestId}: ${JSON.stringify(response.data)}`;
                console.error(erroMsg);
                erros.push({ type: 'Verificação de Status', message: erroMsg }); // Adiciona erro ao relatório
            }
        } catch (error) {
            const erroMsg = `Erro ao verificar o status para requestId ${requestInfo.requestId}: ${error.response ? JSON.stringify(error.response.data) : error.message}`;
            console.error(erroMsg);
            erros.push({ type: 'Verificação de Status', message: erroMsg }); // Adiciona erro ao relatório
        }
    }

    return resultados; // Retorna os resultados das verificações
}

// Função para listar as plataformas disponíveis
async function listarPlataformas(token, erros) {
    try {
        const response = await axios.get('https://api.capturaweb.com.br/v1/available', {
            headers: { 'Authorization': `Bearer ${token}`, 'accept': '*/*' }
        });

        if (response.data && response.data.data && response.data.data[0].platforms) {
            return response.data.data[0].platforms; // Retorna as plataformas disponíveis
        } else {
            throw new Error('Estrutura inesperada na resposta ao listar plataformas.'); // Lança erro se a estrutura for inesperada
        }
    } catch (error) {
        const erroMsg = `Erro ao listar plataformas: ${error.response ? JSON.stringify(error.response.data) : error.message}`;
        console.error(erroMsg);
        erros.push({ type: 'Listar Plataformas', message: erroMsg }); // Adiciona erro ao relatório
        throw error; // Lança o erro para ser tratado em outro lugar
    }
}

// Função para gerar um relatório de erros
function gerarRelatorioDeErros(erros) {
    if (erros.length > 0) {
        const relatorioErros = {
            totalErros: erros.length,
            detalhes: erros,
        };

        try {
            fs.writeFileSync('relatorio_erros.json', JSON.stringify(relatorioErros, null, 2), 'utf-8');
            console.log('Relatório de erros salvo em relatorio_erros.json'); // Confirmação de salvamento
        } catch (fileError) {
            console.error('Erro ao salvar o relatório de erros:', fileError.message);
        }
    } else {
        console.log('Nenhum erro foi encontrado.'); // Mensagem se não houver erros
    }
}

// Exemplo de uso com um CNPJ específico
const cnpj = '27865757000102'; //Exemplo: CNPJ da Globo : 27.865.757/0001-02
consultarEExportarDados(cnpj); // Chama a função principal
