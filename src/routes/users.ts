import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
} from '../dal/users.js';

const router = Router();

// GET /users
router.get('/', async (_req, res) => {
  const users = await getAllUsers();
  res.status(200).json(users);
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const user = await getUserById(id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json(user);
});

// POST /users
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  const user = await createUser({
    name,
    email,
  });

  res.status(201).json(user);
});

export default router;