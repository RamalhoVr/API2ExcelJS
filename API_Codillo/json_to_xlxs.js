const XLSX = require('xlsx');
const fs = require('fs');

// Função para transformar os dados em formato de planilha
async function criarPlanilha() {
    try {
        // Lê o arquivo JSON
        const dadosJson = JSON.parse(fs.readFileSync('resultados_por_cnj.json', 'utf8'));

        // Array para armazenar dados de covers
        const coversData = [];

        // Array para armazenar dados de people
        const peopleData = [];

        // Array para armazenar dados de steps
        const stepsData = [];

        // Itera sobre cada processo nos dados
        Object.entries(dadosJson).forEach(([cnj, processo]) => {
            const requestId = processo?.requestId || '';
            const processoData = processo?.dados?.data;

            // Verifica se `processoData` é um array válido
            if (!Array.isArray(processoData)) {
                console.warn(`processoData não é um array para CNJ ${cnj}`);
                // Adiciona como processo sigiloso
                coversData.push({
                    CNJ: cnj,
                    Processo: "Processo Sigiloso",
                    ClasseProcessual: null,
                    AssuntoPrincipal: null,
                    AssuntosSecundarios: null,
                    Comarca: null,
                    Competencia: null,
                    Autuacao: null,
                    Juizo: null,
                    Distribuicao: null,
                    Juiz: null,
                    Instancia: null,
                    Number: null,
                    Subject: null,
                    District: null,
                    Origin: null,
                    StartAt: null,
                    Degree: null,
                });
                return; // Pula CNJs com dados inválidos
            }

            processoData.forEach((entry) => {
                const coverItems = entry.cover || [];
                const properties = entry.properties || {};
                const people = entry.people || [];
                const steps = entry.steps || [];

                // Monta uma linha combinada para covers
                const row = {
                    CNJ: cnj,
                    Processo: coverItems.find((item) => item.description === "Processo")?.value || null,
                    ClasseProcessual: coverItems.find((item) => item.description === "Classe Processual")?.value || null,
                    AssuntoPrincipal: coverItems.find((item) => item.description === "Assunto Principal")?.value || null,
                    AssuntosSecundarios: coverItems.find((item) => item.description === "Assuntos Secundários")?.value || null,
                    Comarca: coverItems.find((item) => item.description === "Comarca")?.value || null,
                    Competencia: coverItems.find((item) => item.description === "Competência")?.value || null,
                    Autuacao: coverItems.find((item) => item.description === "Autuação")?.value || null,
                    Juizo: coverItems.find((item) => item.description === "Juízo")?.value || null,
                    Distribuicao: coverItems.find((item) => item.description === "Distribuição")?.value || null,
                    Juiz: coverItems.find((item) => item.description === "Juiz")?.value || null,
                    Instancia: coverItems.find((item) => item.description === "Instância")?.value || null,
                    Number: properties.number || null,
                    Subject: properties.subject || null,
                    District: properties.district || null,
                    Origin: properties.origin || null,
                    StartAt: properties.startAt || null,
                    Degree: properties.degree || null,
                };

                // Adiciona à lista de dados de covers
                coversData.push(row);

                // Processa os dados de people
                people.forEach((person) => {
                    const pole = person.pole || null;
                    const description = person.description || null;
                    const name = person.name || null;

                    // Advogados
                    const lawyers = person.lawyers || [];
                    if (lawyers.length === 0) {
                        // Adiciona a pessoa sem advogados
                        peopleData.push({
                            CNJ: cnj,
                            RequestId: requestId,
                            Pole: pole,
                            Description: description,
                            Name: name,
                            LawyerName: null,
                            LawyerUF: null,
                            LawyerOAB: null,
                        });
                    } else {
                        // Adiciona cada advogado como uma linha
                        lawyers.forEach((lawyer) => {
                            peopleData.push({
                                CNJ: cnj,
                                RequestId: requestId,
                                Pole: pole,
                                Description: description,
                                Name: name,
                                LawyerName: lawyer.name || null,
                                LawyerUF: lawyer.uf || null,
                                LawyerOAB: lawyer.oab || null,
                            });
                        });
                    }
                });

                // Processa os dados de steps com mais detalhes
                steps.forEach((step) => {
                    stepsData.push({
                        CNJ: cnj,
                        RequestId: requestId,
                        Seq: step.seq || null,
                        Timestamp: step.timestamp || null,
                        Title: step.title || null,
                        Description: step.description || null,
                        ActionBy: step.actionBy || null,
                        StepDate: new Date(step.timestamp).toLocaleDateString('pt-BR'), // Data formatada do passo
                        StepTime: new Date(step.timestamp).toLocaleTimeString('pt-BR'), // Hora formatada do passo
                    });
                });
            });

            // Adiciona processos sigilosos
            if (processo?.dados?.data === "Nenhum processo/recurso público encontrado. Somente processos/recursos com nível de sigilo público podem ser pesquisados na consulta pública.") {
                coversData.push({
                    CNJ: cnj,
                    Processo: "Processo Sigiloso",
                    ClasseProcessual: null,
                    AssuntoPrincipal: null,
                    AssuntosSecundarios: null,
                    Comarca: null,
                    Competencia: null,
                    Autuacao: null,
                    Juizo: null,
                    Distribuicao: null,
                    Juiz: null,
                    Instancia: null,
                    Number: null,
                    Subject: null,
                    District: null,
                    Origin: null,
                    StartAt: null,
                    Degree: null,
                });
            }
        });

        // Salva os dados de covers em um arquivo separado
        if (coversData.length > 0) {
            const coversSheet = XLSX.utils.json_to_sheet(coversData);
            const coversWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(coversWorkbook, coversSheet, 'Covers');
            XLSX.writeFile(coversWorkbook, 'resultados_covers.xlsx');
            console.log('Planilha de Covers criada com sucesso: resultados_covers.xlsx');
        }

        // Salva os dados de people em um arquivo separado
        if (peopleData.length > 0) {
            const peopleSheet = XLSX.utils.json_to_sheet(peopleData);
            const peopleWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(peopleWorkbook, peopleSheet, 'People');
            XLSX.writeFile(peopleWorkbook, 'resultados_people.xlsx');
            console.log('Planilha de People criada com sucesso: resultados_people.xlsx');
        }

        // Salva os dados de steps em um arquivo separado
        if (stepsData.length > 0) {
            const stepsSheet = XLSX.utils.json_to_sheet(stepsData);
            const stepsWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(stepsWorkbook, stepsSheet, 'Steps');
            XLSX.writeFile(stepsWorkbook, 'resultados_steps.xlsx');
            console.log('Planilha de Steps criada com sucesso: resultados_steps.xlsx');
        }

    } catch (erro) {
        console.error('Erro ao criar planilha:', erro.message);
    }
}

// Executa a função
criarPlanilha();
