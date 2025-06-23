import { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from "../../../lib/mysql";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const users = req.body;

  if (!Array.isArray(users)) {
    return res.status(400).json({ error: 'Waiting for array of objects' });
  }

  const conn = await getConnection();

  try {
    for (const row of users) {
      const name = row['Name'];
      const email = row['Email'];
      let createdAt = row['Created At'];

      // Skip, if no mandatory fields
      if (!name || !email) continue;

      // If date exists, invert it to YYYY-MM-DD
      if (createdAt) {
        const d = new Date(createdAt);
        if (!isNaN(d.getTime())) {
          createdAt = d.toISOString().slice(0, 10); // YYYY-MM-DD
        } else {
          createdAt = null;
        }
      }

      await conn.query(
          'INSERT INTO user (name, email, createdAt) VALUES (?, ?, ?)',
          [name, email, createdAt || new Date()]
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Error during import' });
  } finally {
    conn.release();
  }
}
