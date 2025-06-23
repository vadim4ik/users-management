import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  }
  if (req.method === 'POST') {
    const { name, email } = req.body;
    const user = await prisma.user.create({ data: { name, email } });
    return res.status(201).json(user);
  }
  if (req.method === 'DELETE') {
    await prisma.user.deleteMany();
    return res.status(200).json({ message: 'All users deleted' });
  }
}
