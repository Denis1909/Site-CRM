import React, { useState } from 'react';
import '../App.css'; // Reutiliza os estilos gerais

function PartnerRegistrationPage() {
    const API_BASE_URL = 'http://localhost:3001/api'; // URL base do seu backend

    // Estados para os campos do parceiro de negócio (cliente)
    const [partnerCategory, setPartnerCategory] = useState('PJ'); // 'PJ' (Pessoa Jurídica) ou 'PF' (Pessoa Física)

    const [partnerName, setPartnerName] = useState(''); // Nome/Razão Social
    const [cnpjCpf, setCnpjCpf] = useState('');         // CNPJ ou CPF
    const [ieRg, setIeRg] = useState('');               // Inscrição Estadual ou RG

    // NOVOS ESTADOS para PJ
    const [fantasyName, setFantasyName] = useState('');    // Nome Fantasia
    const [legalResponsible, setLegalResponsible] = useState(''); // Responsável Legal

    // NÃO MEXER NESSES, SERÃO USADOS EM PF (reutilizados para contatos)
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('Lead'); // Status do parceiro, padrão 'Lead'

    // Endereço (comum a PJ e PF, mas será exibido na aba de endereço de cada um)
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Outros (agora Informações Financeiras)
    const [paymentTerms, setPaymentTerms] = useState('');
    const [industry, setIndustry] = useState('');
    const [observations, setObservations] = useState('');

    // NOVO ESTADO para controlar a aba ativa DENTRO da Pessoa Jurídica
    const [activePjTab, setActivePjTab] = useState('pj_company'); // 'pj_company' ou 'pj_address'

    // Estado para controlar a aba ativa DENTRO da Pessoa Física
    const [activePfTab, setActivePfTab] = useState('pf_personal'); // 'pf_personal', 'pf_address', 'pf_financial'

    const handleRegisterPartner = async (event) => { // Tornar a função assíncrona
        event.preventDefault();

        // Validações básicas antes de prosseguir (exemplo)
        if (partnerCategory === 'PJ') {
            if (activePjTab === 'pj_company' && (!partnerName || !fantasyName || !cnpjCpf || !ieRg || !legalResponsible)) {
                alert('Por favor, preencha todos os campos obrigatórios em "Dados da Empresa".');
                return;
            }
            if (activePjTab === 'pj_address' && (!street || !number || !neighborhood || !city || !state || !zipCode)) {
                alert('Por favor, preencha todos os campos obrigatórios em "Endereço".');
                return;
            }
        } else if (partnerCategory === 'PF') {
            if (activePfTab === 'pf_personal' && (!partnerName || !cnpjCpf || !ieRg || !email || !phone)) {
                alert('Por favor, preencha todos os campos obrigatórios em "Dados da Pessoa".');
                return;
            }
            if (activePfTab === 'pf_address' && (!street || !number || !neighborhood || !city || !state || !zipCode)) {
                alert('Por favor, preencha todos os campos obrigatórios em "Endereço".');
                return;
            }
            if (activePfTab === 'pf_financial' && (!paymentTerms || !industry)) {
                alert('Por favor, preencha todos os campos obrigatórios em "Informações Financeiras".');
                return;
            }
        }

        // Montar o objeto de dados para enviar ao backend
        const partnerData = {
            partnerCategory,
            name: partnerCategory === 'PJ' ? partnerName : partnerName, // Razão Social ou Nome do Contato
            cnpjCpf: cnpjCpf,
            ieRg: ieRg,
            street,
            number,
            neighborhood,
            city,
            state,
            zipCode,
            status, // 'Lead' por padrão
            observations,
            // Campos opcionais/condicionais
            ...(partnerCategory === 'PJ' && { fantasyName, legalResponsible }),
            ...(partnerCategory === 'PF' && { phone, email, paymentTerms, industry }), // paymentTerms e industry movidos para PF aqui
        };

        try {
            const response = await fetch(`${API_BASE_URL}/partners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(partnerData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Parceiro cadastrado via API:', data);
            alert('Parceiro cadastrado com sucesso!');

            // Resetar todos os campos do formulário após o sucesso
            setPartnerCategory('PJ');
            setPartnerName('');
            setCnpjCpf('');
            setIeRg('');
            setFantasyName('');
            setLegalResponsible('');
            setPhone('');
            setEmail('');
            setStatus('Lead');
            setStreet('');
            setNumber('');
            setNeighborhood('');
            setCity('');
            setState('');
            setZipCode('');
            setPaymentTerms('');
            setIndustry('');
            setObservations('');
            setActivePjTab('pj_company');
            setActivePfTab('pf_personal');


        } catch (error) {
            console.error("Erro ao cadastrar parceiro via API:", error);
            alert(`Erro ao cadastrar parceiro: ${error.message}`);
        }
    };

    return (
        <div className="container">
            <h2>Cadastro de Parceiro de Negócio (Lead)</h2>
            <form onSubmit={handleRegisterPartner}>

                {/* Seletor de Categoria (Pessoa Física ou Jurídica) */}
                <div className="form-group">
                    <label htmlFor="partnerCategory">Tipo de Parceiro: *</label>
                    <select
                        id="partnerCategory"
                        value={partnerCategory}
                        onChange={(e) => {
                            setPartnerCategory(e.target.value);
                            // Opcional: Resetar campos específicos ao mudar de categoria
                            setCnpjCpf('');
                            setIeRg('');
                            setPartnerName(''); // Limpar nome para adequar ao tipo
                            setFantasyName(''); // Limpar nome fantasia
                            setLegalResponsible(''); // Limpar responsável legal
                            setPhone(''); // Limpar telefone
                            setEmail(''); // Limpar email
                            // setContactName(''); // Este campo foi removido/reutilizado
                            setStreet(''); // Limpar endereço
                            setNumber('');
                            setNeighborhood('');
                            setCity('');
                            setState('');
                            setZipCode('');
                            setPaymentTerms(''); // Limpar financeiros
                            setIndustry('');
                            setObservations('');

                            // Resetar abas para a primeira ao mudar de categoria
                            setActivePjTab('pj_company');
                            setActivePfTab('pf_personal');
                        }}
                        required
                    >
                        <option value="PJ">Pessoa Jurídica</option>
                        <option value="PF">Pessoa Física</option>
                    </select>
                </div>

                {/* CAMPO DE STATUS (COMUM A AMBOS) */}
                <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <input
                        type="text"
                        id="status"
                        value={status}
                        readOnly
                    />
                </div>

                {/* BLOCO PARA PESSOA JURÍDICA - COM ABAS INTERNAS */}
                {partnerCategory === 'PJ' && (
                    <div className="pj-tabs-container">
                        <h3>Dados da Pessoa Jurídica</h3>

                        {/* Navegação das Abas da Pessoa Jurídica */}
                        <div className="tabs pj-tabs">
                            <button
                                type="button"
                                className={activePjTab === 'pj_company' ? 'active' : ''}
                                onClick={() => setActivePjTab('pj_company')}
                            >
                                Dados da Empresa
                            </button>
                            <button
                                type="button"
                                className={activePjTab === 'pj_address' ? 'active' : ''}
                                onClick={() => setActivePjTab('pj_address')}
                            >
                                Endereço
                            </button>
                        </div>

                        {/* CONTEÚDO DA ABA 'DADOS DA EMPRESA' (PJ) */}
                        {activePjTab === 'pj_company' && (
                            <div className="tab-content pj-tab-content">
                                <div className="form-group">
                                    <label htmlFor="partnerNamePJ">Razão Social: *</label>
                                    <input
                                        type="text"
                                        id="partnerNamePJ"
                                        value={partnerName}
                                        onChange={(e) => setPartnerName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fantasyName">Nome Fantasia: *</label>
                                    <input
                                        type="text"
                                        id="fantasyName"
                                        value={fantasyName}
                                        onChange={(e) => setFantasyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cnpjCpfPJ">CNPJ: *</label>
                                    <input
                                        type="text"
                                        id="cnpjCpfPJ"
                                        value={cnpjCpf}
                                        onChange={(e) => setCnpjCpf(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ieRgPJ">Inscrição Estadual: *</label>
                                    <input
                                        type="text"
                                        id="ieRgPJ"
                                        value={ieRg}
                                        onChange={(e) => setIeRg(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="legalResponsible">Responsável Legal: *</label>
                                    <input
                                        type="text"
                                        id="legalResponsible"
                                        value={legalResponsible}
                                        onChange={(e) => setLegalResponsible(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Botão Próximo para a aba de Endereço PJ */}
                                <button type="button" onClick={() => setActivePjTab('pj_address')}>Próximo</button>
                            </div>
                        )}

                        {/* CONTEÚDO DA ABA 'ENDEREÇO' (PJ) */}
                        {activePjTab === 'pj_address' && (
                            <div className="tab-content pj-tab-content">
                                <h3>Endereço</h3>
                                <div className="form-group">
                                    <label htmlFor="streetPJ">Rua: *</label>
                                    <input type="text" id="streetPJ" value={street} onChange={(e) => setStreet(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="numberPJ">Número: *</label>
                                    <input type="text" id="numberPJ" value={number} onChange={(e) => setNumber(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="neighborhoodPJ">Bairro: *</label>
                                    <input type="text" id="neighborhoodPJ" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cityPJ">Cidade: *</label>
                                    <input type="text" id="cityPJ" value={city} onChange={(e) => setCity(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="statePJ">Estado: *</label>
                                    <input type="text" id="statePJ" value={state} onChange={(e) => setState(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="zipCodePJ">CEP: *</label>
                                    <input type="text" id="zipCodePJ" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                                </div>
                                {/* Botão Anterior para Dados da Empresa PJ */}
                                <button type="button" onClick={() => setActivePjTab('pj_company')}>Anterior</button>
                                {/* Botão de submit final do formulário aparecerá aqui para PJ */}
                                <button type="submit">Cadastrar Parceiro (Lead)</button>
                            </div>
                        )}
                    </div> /* Fim de pj-tabs-container */
                )}

                {/* --- BLOCO PARA PESSOA FÍSICA - AGORA COM ABAS INTERNAS --- */}
                {partnerCategory === 'PF' && (
                    <div className="pf-tabs-container">
                        <h3>Dados da Pessoa Física</h3>

                        {/* Navegação das Abas da Pessoa Física */}
                        <div className="tabs pf-tabs">
                            <button
                                type="button"
                                className={activePfTab === 'pf_personal' ? 'active' : ''}
                                onClick={() => setActivePfTab('pf_personal')}
                            >
                                Dados da Pessoa
                            </button>
                            <button
                                type="button"
                                className={activePfTab === 'pf_address' ? 'active' : ''}
                                onClick={() => setActivePfTab('pf_address')}
                            >
                                Endereço
                            </button>
                            <button
                                type="button"
                                className={activePfTab === 'pf_financial' ? 'active' : ''}
                                onClick={() => setActivePfTab('pf_financial')}
                            >
                                Informações Financeiras
                            </button>
                        </div>

                        {/* CONTEÚDO DA ABA 'DADOS DA PESSOA' (PF) */}
                        {activePfTab === 'pf_personal' && (
                            <div className="tab-content pf-tab-content">
                                <div className="form-group">
                                    <label htmlFor="partnerNamePF">Nome do Contato: *</label>
                                    <input
                                        type="text"
                                        id="partnerNamePF"
                                        value={partnerName} // Reutilizando partnerName para o nome da pessoa física
                                        onChange={(e) => setPartnerName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cnpjCpfPF">CPF: *</label>
                                    <input
                                        type="text"
                                        id="cnpjCpfPF"
                                        value={cnpjCpf} // Reutilizando cnpjCpf para o CPF
                                        onChange={(e) => setCnpjCpf(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ieRgPF">RG: *</label>
                                    <input
                                        type="text"
                                        id="ieRgPF"
                                        value={ieRg} // Reutilizando ieRg para o RG
                                        onChange={(e) => setIeRg(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emailPF">E-mail: *</label>
                                    <input
                                        type="email"
                                        id="emailPF"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phonePF">Telefone do Contato: *</label>
                                    <input
                                        type="text"
                                        id="phonePF"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Botão Próximo para a aba de Endereço PF */}
                                <button type="button" onClick={() => setActivePfTab('pf_address')}>Próximo</button>
                            </div>
                        )}

                        {/* CONTEÚDO DA ABA 'ENDEREÇO' (PF) */}
                        {activePfTab === 'pf_address' && (
                            <div className="tab-content pf-tab-content">
                                <h3>Endereço</h3>
                                <div className="form-group">
                                    <label htmlFor="streetPF">Rua: *</label>
                                    <input type="text" id="streetPF" value={street} onChange={(e) => setStreet(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="numberPF">Número: *</label>
                                    <input type="text" id="numberPF" value={number} onChange={(e) => setNumber(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="neighborhoodPF">Bairro: *</label>
                                    <input type="text" id="neighborhoodPF" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cityPF">Cidade: *</label>
                                    <input type="text" id="cityPF" value={city} onChange={(e) => setCity(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="statePF">Estado: *</label>
                                    <input type="text" id="statePF" value={state} onChange={(e) => setState(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="zipCodePF">CEP: *</label>
                                    <input type="text" id="zipCodePF" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                                </div>
                                {/* Botões Anterior e Próximo para Endereço PF */}
                                <button type="button" onClick={() => setActivePfTab('pf_personal')}>Anterior</button>
                                <button type="button" onClick={() => setActivePfTab('pf_financial')}>Próximo</button>
                            </div>
                        )}

                        {/* CONTEÚDO DA ABA 'INFORMAÇÕES FINANCEIRAS' (PF) */}
                        {activePfTab === 'pf_financial' && (
                            <div className="tab-content pf-tab-content">
                                <h3>Informações Financeiras</h3>
                                <div className="form-group">
                                    <label htmlFor="paymentTermsPF">Condição de Pagamento: *</label>
                                    <input type="text" id="paymentTermsPF" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="industryPF">Setor/Indústria: *</label>
                                    <input type="text" id="industryPF" value={industry} onChange={(e) => setIndustry(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="observationsPF">Observações:</label>
                                    <textarea id="observationsPF" value={observations} onChange={(e) => setObservations(e.target.value)} rows="4"></textarea>
                                </div>
                                {/* Botão Anterior para Endereço PF e o botão de submit final */}
                                <button type="button" onClick={() => setActivePfTab('pf_address')}>Anterior</button>
                                <button type="submit">Cadastrar Parceiro (Lead)</button>
                            </div>
                        )}
                    </div> /* Fim de pf-tabs-container */
                )}

            </form>
        </div>
    );
}

export default PartnerRegistrationPage;