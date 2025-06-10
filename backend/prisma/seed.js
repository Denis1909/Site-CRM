// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Certifique-se de ter o bcryptjs instalado

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seed...');

  const userEmail = 'gerente1.teste@outlook.com';
  const userPasswordPlain = 'T12345'; // A senha em texto puro que será hashada
  const saltRounds = 10; // O mesmo valor de saltRounds que você usa no seu backend

  const hashedPassword = await bcrypt.hash(userPasswordPlain, saltRounds);
  console.log('Senha hashada com sucesso.');

  try {
    const testUser = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        password: hashedPassword,
        userType: 'manager', // Conforme o userType que você quer
        branch: 'matriz'    // Conforme a branch que você quer
      },
      create: {
        firstName: 'gerente1',
        lastName: 'teste',
        email: userEmail,
        password: hashedPassword,
        userType: 'manager',
        branch: 'matriz'
      },
    });
    console.log(`Usuário de teste criado/atualizado: ${testUser.email}`);
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário de teste:', error);
  }

  console.log('Script de seed finalizado.');
}

main()
  .catch(e => {
    console.error('Erro geral no script de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma Client desconectado.');
  });