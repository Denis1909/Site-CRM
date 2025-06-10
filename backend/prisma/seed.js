import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; // Certifique-se de ter o bcryptjs instalado

const prisma = new PrismaClient();

async function main() {
  // ##############################################
  // CRIE UM USUÁRIO DE TESTE AQUI
  // CUIDADO: NUNCA USE SENHAS EM CLARO EM PRODUÇÃO!
  // ##############################################

  const hashedPassword = await bcrypt.hash('T12345', 10); // Altere 'sua_senha_secreta'
  // O '10' é o saltRounds, o mesmo que você usa no seu backend ao criar usuários

  const testUser = await prisma.user.upsert({
    where: { email: 'teste.gerente@outlook.com' }, // Email do usuário de teste
    update: {
      password: hashedPassword, // Atualiza a senha se o usuário já existir
      userType: 'manager', // Tipo de usuário, ex: 'manager', 'seller'
      branch: 'matriz', // Filial
    },
    create: {
      firstName: 'Gerente1',
      lastName: 'teste',
      email: 'teste.gerente@outlook.com', // Email do usuário de teste
      password: hashedPassword,
      userType: 'manager', // Tipo de usuário, ex: 'manager', 'seller'
      branch: 'matriz', // Filial
    },
  });

  console.log(`Usuário de teste criado/atualizado: ${testUser.email}`);

  // ##############################################
  // Você pode adicionar mais dados aqui, se precisar
  // ##############################################

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
