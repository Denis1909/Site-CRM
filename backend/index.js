// backend/index.js
console.log('****** Versão do Backend: FINAL PARA DEPLOY Render.com - 06/06/2025 ******');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path'); // Necessário para servir arquivos estáticos

const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// --------------------------------------------------------------------------------------
// Configuração para servir o Frontend em Produção (NOVO BLOCO PARA DEPLOY)
// --------------------------------------------------------------------------------------
// Verifica se o ambiente é de produção
if (process.env.NODE_ENV === 'production') {
    // Serve os arquivos estáticos do frontend (build da aplicação React)
    // path.join(__dirname, '..', 'frontend', 'dist') é o caminho para a pasta 'dist' dentro de 'frontend'
    app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

    // Para qualquer requisição que não seja da API, serve o index.html do frontend
    // Isso é importante para o roteamento do React (SPA - Single Page Application)
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
    });
} else {
    // Em desenvolvimento, permite CORS para que o frontend (em outra porta) se comunique
    app.use(cors());
}
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// ROTAS DA API (Sempre prefixadas com /api para não conflitar com rotas do frontend)
// --------------------------------------------------------------------------------------

// Rota de teste
app.get('/api', (req, res) => {
    res.send('API do CRM está online e conectada ao DB!');
});

// 1. Rota de REGISTRO de Usuário
app.post('/api/register', async (req, res) => {
    const { firstName, middleName, lastName, email, password, userType, branch, manager } = req.body;

    if (!firstName || !lastName || !email || !password || !userType || !branch) {
        return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
    }

    const validatePasswordComplexity = (pwd) => {
        let errors = [];
        if (!/[A-Z]/.test(pwd)) {
            errors.push('pelo menos 1 letra maiúscula');
        }
        if (!/[0-9]|[^a-zA-Z0-9]/.test(pwd)) {
            errors.push('pelo menos 1 número ou símbolo');
        }
        if (pwd.length < 6 || pwd.length > 12) {
            errors.push('entre 6 e 12 caracteres');
        }
        return errors;
    };

    const complexityErrors = validatePasswordComplexity(password);
    if (complexityErrors.length > 0) {
        return res.status(400).json({ message: `A senha precisa ter: ${complexityErrors.join(', ')}.` });
    }

    const validUserTypes = ['seller', 'manager', 'client'];
    if (!validUserTypes.includes(userType)) {
        return res.status(400).json({ message: "Tipo de usuário inválido. Use 'seller', 'manager' ou 'client'." });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                firstName,
                middleName: middleName || null,
                lastName,
                email,
                password: hashedPassword,
                userType,
                branch,
                managerId: manager === '' ? null : manager,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                userType: true,
                branch: true,
                createdAt: true,
            },
        });

        res.status(201).json({ message: "Usuário registrado com sucesso!", user: newUser });

    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao registrar usuário." });
    }
});


// 2. Rota de LOGIN de Usuário
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Por favor, insira e-mail e senha." });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        res.status(200).json({
            message: "Login bem-sucedido!",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                branch: user.branch,
            },
        });

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: "Erro interno do servidor ao fazer login." });
    }
});

// --------------------------------------------------------------------------------------
// ROTAS PARA PARCEIROS (Partners)
// --------------------------------------------------------------------------------------

// 3. Rota de CADASTRO de Parceiro (POST /api/partners)
app.post('/api/partners', async (req, res) => {
    const {
        partnerCategory,
        name,
        cnpjCpf,
        ieRg,
        fantasyName,
        legalResponsible,
        phone,
        email,
        street,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        paymentTerms,
        industry,
        observations,
        status
    } = req.body;

    if (!partnerCategory || !name || !cnpjCpf || !street || !number || !neighborhood || !city || !state || !zipCode) {
        return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios básicos do parceiro." });
    }

    if (partnerCategory === 'PJ') {
        if (!fantasyName || !legalResponsible) {
            return res.status(400).json({ message: "Para Pessoa Jurídica, Nome Fantasia e Responsável Legal são obrigatórios." });
        }
        if (email || phone) {
            console.warn("Campos de email/telefone fornecidos para PJ, serão ignorados.");
        }
    } else if (partnerCategory === 'PF') {
        if (!email || !phone) {
            return res.status(400).json({ message: "Para Pessoa Física, E-mail e Telefone são obrigatórios." });
        }
        if (fantasyName || legalResponsible) {
            console.warn("Campos de Nome Fantasia/Responsável Legal fornecidos para PF, serão ignorados.");
        }
    } else {
        return res.status(400).json({ message: "Categoria de parceiro inválida. Deve ser 'PJ' ou 'PF'." });
    }

    try {
        const existingPartnerByCnpjCpf = await prisma.partner.findUnique({
            where: { cnpjCpf: cnpjCpf }, // CORRIGIDO: era 'cnpjCnpj'
        });

        if (existingPartnerByCnpjCpf) {
            return res.status(409).json({ message: `Parceiro com este ${partnerCategory === 'PJ' ? 'CNPJ' : 'CPF'} já cadastrado.` });
        }

        if (partnerCategory === 'PF' && email) {
            const existingPartnerByEmail = await prisma.partner.findUnique({
                where: { email: email },
            });
            if (existingPartnerByEmail) {
                return res.status(409).json({ message: "Este e-mail já está em uso por outro parceiro físico." });
            }
        }

        const newPartner = await prisma.partner.create({
            data: {
                partnerCategory,
                name,
                cnpjCpf,
                ieRg: ieRg || null,
                fantasyName: partnerCategory === 'PJ' ? fantasyName : null,
                legalResponsible: partnerCategory === 'PJ' ? legalResponsible : null,
                phone: partnerCategory === 'PF' ? phone : null,
                email: partnerCategory === 'PF' ? email : null,
                street,
                number,
                neighborhood,
                city,
                state,
                zipCode,
                paymentTerms: paymentTerms || null,
                industry: industry || null,
                observations: observations || null,
                status: status || 'Lead',
            },
        });

        res.status(201).json({ message: "Parceiro cadastrado com sucesso!", partner: newPartner });

    } catch (error) {
        console.error("Erro ao cadastrar parceiro:", error);
        res.status(500).json({ message: "Erro interno do servidor ao cadastrar parceiro." });
    }
});

// 4. Rota para LISTAR Parceiros (GET /api/partners)
app.get('/api/partners', async (req, res) => {
    const { search, category } = req.query;

    const whereClause = {};

    if (search) {
        whereClause.name = {
            contains: search,
            mode: 'insensitive',
        };
    }

    if (category) {
        whereClause.partnerCategory = category;
    }

    try {
        const partners = await prisma.partner.findMany({
            where: whereClause,
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json(partners);

    } catch (error) {
        console.error("Erro ao buscar parceiros:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar parceiros." });
    }
});

// --------------------------------------------------------------------------------------
// ROTAS PARA USUÁRIOS (User-related)
// --------------------------------------------------------------------------------------

// 5. Rota para LISTAR Vendedores e Gestores (GET /api/users/sellers-and-managers)
app.get('/api/users/sellers-and-managers', async (req, res) => {
    const { search } = req.query;

    const userTypeFilter = {
        OR: [
            { userType: 'seller' },
            { userType: 'manager' }
        ]
    };

    let whereClause = userTypeFilter;

    if (search) {
        whereClause = {
            AND: [
                userTypeFilter,
                {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                }
            ]
        };
    }

    try {
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                userType: true,
            },
            orderBy: {
                firstName: 'asc',
            },
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("Erro ao buscar vendedores e gestores:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar usuários." });
    }
});


// --------------------------------------------------------------------------------------
// ROTAS PARA VENDAS (Sales)
// --------------------------------------------------------------------------------------

// 6. Rota para REGISTRAR Nova Venda (POST /api/sales)
app.post('/api/sales', async (req, res) => {
    const {
        clienteId,
        productService,
        valorVenda,
        vendedorResponsavelId,
        dataOportunidade,
        observations
    } = req.body;

    if (!clienteId || !productService || !valorVenda || !vendedorResponsavelId || !dataOportunidade) {
        return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios da venda." });
    }

    try {
        const parsedValorVenda = parseFloat(valorVenda);
        if (isNaN(parsedValorVenda)) {
            return res.status(400).json({ message: "Valor da venda inválido." });
        }

        const sellerRecord = await prisma.user.findUnique({
            where: {
                id: vendedorResponsavelId,
                OR: [
                    { userType: 'seller' },
                    { userType: 'manager' }
                ]
            },
            select: { id: true }
        });

        if (!sellerRecord) {
            return res.status(400).json({ message: `Vendedor com ID '${vendedorResponsavelId}' não encontrado ou não tem um perfil de vendedor/gestor.` });
        }

        const newSale = await prisma.sale.create({
            data: {
                partnerId: clienteId,
                productService,
                value: parsedValorVenda,
                sellerId: sellerRecord.id,
                dataOpportunity: new Date(dataOportunidade),
                observations: observations || null,
                status: 'Pendente de Aprovação',
            },
        });

        res.status(201).json({ message: "Venda registrada com sucesso!", sale: newSale });

    } catch (error) {
        console.error("Erro ao registrar venda:", error);
        if (error.code === 'P2003') {
            return res.status(400).json({ message: "ID de cliente ou vendedor inválido. Verifique se existem no banco de dados." });
        }
        res.status(500).json({ message: "Erro interno do servidor ao registrar venda." });
    }
});

// 7. Rota para LISTAR Vendas Pendentes de Aprovação (GET /api/sales/pending)
app.get('/api/sales/pending', async (req, res) => {
    try {
        const pendingSales = await prisma.sale.findMany({
            where: {
                status: 'Pendente de Aprovação',
            },
            include: {
                partner: {
                    select: { name: true, cnpjCpf: true, partnerCategory: true }
                },
                seller: {
                    select: { id: true, firstName: true, lastName: true, email: true, userType: true }
                }
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const formattedSales = pendingSales.map(sale => ({
            ...sale,
            nomeCliente: sale.partner.name,
            vendedorResponsavel: `${sale.seller.firstName} ${sale.seller.lastName}`,
            sellerId: sale.seller.id,
            partner: undefined,
            seller: undefined,
        }));

        res.status(200).json(formattedSales);

    } catch (error) {
        console.error("Erro ao buscar vendas pendentes:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar vendas pendentes." });
    }
});


// 8. Rota para ATUALIZAR STATUS de Venda (PUT /api/sales/:id/status)
app.put('/api/sales/:id/status', async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ['Aprovada', 'Rejeitada'];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: "Status inválido. Use 'Aprovada' ou 'Rejeitada'." });
    }

    try {
        const updatedSale = await prisma.sale.update({
            where: { id: id },
            data: { status: newStatus },
            select: { id: true, status: true, productService: true, partner: { select: { name: true } } }
        });

        res.status(200).json({ message: `Status da venda ${id} atualizado para ${newStatus}.`, sale: updatedSale });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Venda não encontrada." });
        }
        console.error("Erro ao atualizar status da venda:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar status da venda." });
    }
});


// --------------------------------------------------------------------------------------
// ROTAS PARA DASHBOARD (Dashboard)
// --------------------------------------------------------------------------------------

// 9. Rota para dados resumidos do Dashboard (GET /api/dashboard/summary)
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlySales = await prisma.sale.findMany({
            where: {
                status: {
                    in: ['Aprovada', 'Em Negociação']
                },
                createdAt: {
                    gte: new Date(currentYear, currentMonth, 1),
                    lt: new Date(currentYear, currentMonth + 1, 1),
                },
            },
            select: {
                value: true
            }
        });
        const totalMonthlySales = monthlySales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);

        const newLeads = await prisma.partner.count({
            where: {
                status: 'Lead',
                createdAt: {
                    gte: new Date(currentYear, currentMonth, 1),
                    lt: new Date(currentYear, currentMonth + 1, 1),
                },
            },
        });

        const totalOpportunities = await prisma.sale.count({
            where: {
                createdAt: {
                    gte: new Date(currentYear, currentMonth, 1),
                    lt: new Date(currentYear, currentMonth + 1, 1),
                },
            },
        });

        const approvedSalesCount = await prisma.sale.count({
            where: {
                status: 'Aprovada',
                createdAt: {
                    gte: new Date(currentYear, currentMonth, 1),
                    lt: new Date(currentYear, currentMonth + 1, 1),
                },
            },
        });

        const conversionRate = totalOpportunities > 0 ? (approvedSalesCount / totalOpportunities) * 100 : 0;


        res.status(200).json({
            totalMonthlySales: totalMonthlySales.toFixed(2),
            newLeads: newLeads,
            conversionRate: conversionRate.toFixed(2),
        });

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar dados do dashboard." });
    }
});


// --------------------------------------------------------------------------------------
// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

// Graceful shutdown do Prisma quando a aplicação é encerrada
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});