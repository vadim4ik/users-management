import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const id = parseInt(req.query.id);

  if (req.method === 'PUT') {
    const { name, email } = req.body;
    const user = await prisma.user.update({ where: { id }, data: { name, email } });
    return res.status(200).json(user);
  }

  if (req.method === 'DELETE') {
    await prisma.user.delete({ where: { id } });
    return res.status(204).end();
  }
}
