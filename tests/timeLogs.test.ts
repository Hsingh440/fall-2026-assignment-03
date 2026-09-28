import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('logs and aggregates hours for a ticket', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({
        name: 'Time Logger',
        email: `logger-${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);

    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userResponse.body.id))
      .send({
        title: 'Time Tracking Ticket',
        description: 'Track hours here',
      });

    expect(ticketResponse.status).toBe(201);

    const firstLogResponse = await request(app)
      .post(`/tickets/${ticketResponse.body.id}/time`)
      .set('X-User-Id', String(userResponse.body.id))
      .send({ hours: 2.5 });

    const secondLogResponse = await request(app)
      .post(`/tickets/${ticketResponse.body.id}/time`)
      .set('X-User-Id', String(userResponse.body.id))
      .send({ hours: 3.5 });

    expect(firstLogResponse.status).toBe(201);
    expect(secondLogResponse.status).toBe(201);

    const totalResponse = await request(app).get(
      `/tickets/${ticketResponse.body.id}/time`,
    );

    expect(totalResponse.status).toBe(200);
    expect(totalResponse.body).toEqual({
      ticket_id: ticketResponse.body.id,
      total_hours: 6,
    });
  });
});
