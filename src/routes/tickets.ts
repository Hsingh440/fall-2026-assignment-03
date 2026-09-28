import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import { getTotalHoursForTicket, insertTimeLog } from '../dal/timeLogs.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// GET /tickets
router.get('/', async (req, res) => {
  const limit = req.query.limit
    ? Number(req.query.limit)
    : undefined;

  const offset = req.query.offset
    ? Number(req.query.offset)
    : undefined;

  const status = req.query.status
    ? String(req.query.status)
    : undefined;

  const tickets = await getAllTickets({
    limit,
    offset,
    status,
  });

  res.status(200).json(tickets);
});

// GET /tickets/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

// POST /tickets
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'Invalid title' });
    return;
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    res.status(400).json({ error: 'Invalid description' });
    return;
  }

  const ticket = await createTicket({
    title,
    description: description ?? null,
    creator_id: res.locals.userId,
  });

  res.status(201).json(ticket);
});

// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  if (typeof status !== 'string' || status.trim() === '') {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const ticket = await updateTicketStatus(id, status);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

router.post('/:id/time', authMiddleware, async (req, res) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const { hours } = req.body;

  if (typeof hours !== 'number' || !Number.isFinite(hours) || hours <= 0) {
    res.status(400).json({ error: 'Invalid hours' });
    return;
  }

  const timeLog = await insertTimeLog(ticketId, res.locals.userId, hours);

  res.status(201).json(timeLog);
});

router.get('/:id/time', async (req, res) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const totalHours = await getTotalHoursForTicket(ticketId);

  res.status(200).json({
    ticket_id: ticketId,
    total_hours: totalHours,
  });
});

export default router;