// public/app.js
// Script Core de regras visuais e ponte com a rede.

const TEMPLATE_HEADERS = [
  "Cliente", 
  "Projeto", 
  "Etapa", 
  "Responsável (GP)", 
  "Data Início", 
  "Data Prazo", 
  "Status Etapa", 
  "Observação"
];

let globalQueue = [];
let activeFilter = 'Todos';

document.addEventListener('DOMContentLoaded', () => {
    // Escutadores dos cliques nos botoes do Header
    const fileInput = document.getElementById('fileInput');
    const downloadBtn = document.getElementById('btnDownloadTemplate');

    if(fileInput) fileInput.addEventListener('change', parseSheetAndUpload);
    if(downloadBtn) downloadBtn.addEventListener('click', serveTemplateDocument);
    
    // Inicia fluxo 
    refreshQueueFromServer();
});

// Ações Desktop: Download Template do Modelo Restrito
function serveTemplateDocument() {
    // Evade bugs nativos do Excel em acentos através do BOM para UTF-8.
    const csvContent = '\uFEFF' + TEMPLATE_HEADERS.join(';') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Virtual Anchor p/ download nativo
    const url = URL.createObjectURL(blob);
    const mockAnchor = document.createElement("a");
    mockAnchor.href = url;
    mockAnchor.setAttribute("download", "Mukutu_Modelo_Operacao.csv");
    document.body.appendChild(mockAnchor);
    mockAnchor.click();
    
    // Garbage Collector call
    document.body.removeChild(mockAnchor);
    URL.revokeObjectURL(url);
}

// Ações de Uplolad: SheetJS Parsing -> JSON -> Vercel Serverless Post
async function parseSheetAndUpload(event) {
    const virtualFile = event.target.files[0];
    if (!virtualFile) return;

    toggleLoader(true);

    const freader = new FileReader();
    freader.onload = async (e) => {
        try {
            // Rotinas SheetJS
            const binaryArr = new Uint8Array(e.target.result);
            const workbookObj = XLSX.read(binaryArr, { type: 'array' });
            
            const firstSheetData = workbookObj.Sheets[workbookObj.SheetNames[0]];
            const rawJsonLines = XLSX.utils.sheet_to_json(firstSheetData, { defval: "" });

            // Refinanciamento e Validação - Obriga a possuir chaves padronizadas (Opcional, porém blindador de erros backend):
            const mappedSubmition = rawJsonLines.map(r => ({
               cliente: String(r["Cliente"] || ""),
               projeto: String(r["Projeto"] || ""),
               etapa: String(r["Etapa"] || ""),
               responsavel: String(r["Responsável (GP)"] || ""),
               data_inicio: String(r["Data Início"] || ""),
               data_prazo: String(r["Data Prazo"] || ""),
               status_etapa: String(r["Status Etapa"] || ""),
               observacao: String(r["Observação"] || "")
            }));

            // Sync via REST Fetch para a nossa Vercel Node API (protegido do usuario)
            await postToServerlessEngine(mappedSubmition);
            
        } catch (erroDeExtracao) {
            console.error(erroDeExtracao);
            alert("A importação sofreu uma exceção: " + erroDeExtracao.message);
        } finally {
            document.getElementById('fileInput').value = ""; // Clear file buffer.
            toggleLoader(false);
        }
    };
    freader.readAsArrayBuffer(virtualFile);
}

async function postToServerlessEngine(payloadObj) {
    try {
        const response = await fetch('/api/saveQueue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadObj)
        });
        
        if (!response.ok) throw new Error(await response.text());
        refreshQueueFromServer(); 

    } catch (networkErr) {
        console.error("Vercel API Sinc Error:", networkErr);
        alert("Falha de Comunicação com a Nuvem: " + networkErr.message);
    }
}

// Inicializador: Puxar do Supabase via Vercel Edge API GET.
async function refreshQueueFromServer() {
    toggleLoader(true);
    try {
        const payloadStream = await fetch('/api/getQueue');
        if (!payloadStream.ok) throw new Error(await payloadStream.text());
        
        globalQueue = await payloadStream.json();
        renderDenseUIGrid();
        
    } catch (e) {
        console.error(e);
        document.getElementById('queueContainer').innerHTML = `<p class="text-red-600 text-center font-bold">Falha Grave: Não foi possível baixar os pacotes da fila atual.</p>`;
    } finally {
        toggleLoader(false);
    }
}

// UX/UI: Transforma os objetos lógicos em Layout DOM (Componentes Lista)
function renderDenseUIGrid() {
    renderFilters();
    
    const listWrapper = document.getElementById('queueContainer');
    listWrapper.innerHTML = '';

    let filteredQueue = globalQueue;
    if (activeFilter !== 'Todos') {
        filteredQueue = globalQueue.filter(r => r.status_etapa === activeFilter);
    }

    if (!Array.isArray(filteredQueue) || filteredQueue.length === 0) {
        listWrapper.innerHTML = `
        <div class="text-center py-20 bg-white rounded-lg border border-gray-200">
            <p class="text-gray-500 font-medium">A fila de processos repousa em paz.</p>
            <p class="text-sm text-gray-400 mt-1">Carregue ou importe um Documento para preencher o Dashboard.</p>
        </div>`;
        return;
    }

    filteredQueue.forEach(record => {
        // Regras de Cores Google Stitch de forma reativa local
        let labelPillClass = 'bg-gray-100 text-gray-700'; // Default
        const txt = record.status_etapa.toLowerCase();
        
        if (txt.includes('andamento')) labelPillClass = 'bg-blue-100 text-blue-700 border-blue-200';
        if (txt.includes('concl') || txt.includes('fim')) labelPillClass = 'bg-green-100 text-green-700 border-green-200';
        if (txt.includes('pausa') || txt.includes('parado') || txt.includes('atras')) labelPillClass = 'bg-red-100 text-red-700 border-red-200';
        if (txt.includes('revis') || txt.includes('ana')) labelPillClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';

        // Base container
        const rowDiv = document.createElement('div');
        // Usamos um border lateral azul pra identificar o core de linha e sombra sutil. Transition nos dá dinâmica.
        rowDiv.className = "bg-white border text-[13px] border-gray-200 rounded-md shadow-sm p-3 gap-y-3 sm:gap-y-0 sm:flex sm:items-center sm:justify-between hover:shadow transition-shadow border-l-[3px] border-l-brand";
        
        rowDiv.innerHTML = `
            <div class="flex flex-col sm:w-[25%] pr-4 cursor-default">
                <span class="text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate">${record.cliente || 'CLIENTE NÃO INFORMADO'}</span>
                <span class="font-bold text-gray-900 leading-tight leading-5 text-[15px] pt-0.5 line-clamp-2" title="${record.projeto}">${record.projeto || 'NOME DO PROJETO FALTANTE'}</span>
            </div>
            
            <div class="flex items-center gap-2 sm:w-[20%] text-brand font-semibold truncate sm:border-l border-gray-100 sm:pl-4">
                ${record.etapa || 'Etapa Não Definida'}
            </div>

            <div class="sm:w-[20%] flex sm:justify-center my-1 sm:my-0">
               <span class="px-2.5 py-1 ${labelPillClass} rounded-full text-[10px] font-bold uppercase tracking-wide truncate border shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
                 ${record.status_etapa || '-----'}
               </span>
            </div>

            <div class="flex items-center gap-2 sm:w-[15%]">
                 ${mountAvatarIcon(record.responsavel)}
                 <span class="font-semibold text-gray-700 truncate">${record.responsavel || 'Sem Dono'}</span>
            </div>

            <div class="flex flex-col text-left sm:text-right hidden md:flex min-w-[120px]">
                <span class="text-[11px] text-gray-400 uppercase font-medium">Data Prazo Definitivo</span>
                <span class="font-bold text-gray-800 tracking-tight">${record.data_prazo || '-'}</span>
            </div>
        `;
        listWrapper.appendChild(rowDiv);
    });
}

// Cria o bolinha com a letro da pessoa
function mountAvatarIcon(rawName) {
    if (!rawName) return `<div class="w-[26px] h-[26px] rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">?</div>`;
    
    // Tratativa rapida para pegar as inicias (Ex: Ana Julia -> AJ)
    const pieces = rawName.toUpperCase().trim().split(" ");
    const letters = pieces.length > 1 ? pieces[0].charAt(0) + pieces[1].charAt(0) : pieces[0].charAt(0);
    
    return `<div class="w-[26px] h-[26px] rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold hover:bg-indigo-200 shrink-0">${letters.substring(0,2)}</div>`;
}

// Controles Visuais
function toggleLoader(forceEnvisionState) {
    document.getElementById('loader').classList.toggle('hidden', !forceEnvisionState);
}

function renderFilters() {
    const filterBox = document.getElementById('filterContainer');
    if(!filterBox) return;
    
    const allStatus = new Set();
    globalQueue.forEach(r => { if(r.status_etapa) allStatus.add(r.status_etapa) });
    
    // Renderiza sempre "Todos" + dinamicamente os Status únicos da tabela
    const filterOptions = ['Todos', ...Array.from(allStatus)];
    
    filterBox.innerHTML = '';
    filterOptions.forEach(opt => {
        const btn = document.createElement('button');
        const isActive = activeFilter === opt;
        btn.className = `px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full border transition-colors ${isActive ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`;
        btn.innerText = opt;
        btn.onclick = () => {
            activeFilter = opt;
            renderDenseUIGrid();
        };
        filterBox.appendChild(btn);
    });
}
