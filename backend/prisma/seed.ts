import prisma from "../src/shared/lib/prisma";
import { hashPassword } from "../src/shared/utils/hashPassword";

async function main() {
  const defaultUser = await prisma.user.upsert({
    where: { email: "usuario@ejemplo.com" },
    update: {},
    create: {
      first_name: "John",
      last_name: "Doe",
      email: "usuario@ejemplo.com",
      password: await hashPassword("123456"),
    },
  });

  console.log("Usuario por defecto creado:", defaultUser);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
