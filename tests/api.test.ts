import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/index.js';

describe('API Integration Tests', () => {
  it('creates a user successfully', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test User');
  });

  it('creates a ticket successfully', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({
        name: 'Ticket User',
        email: `ticket-${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);

    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userResponse.body.id))
      .send({
        title: 'Test Ticket',
        description: 'Testing ticket creation',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Ticket');
  });

  it('rejects ticket creation without X-User-Id', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({
        title: 'Unauthorized Ticket',
        description: 'Should not be created',
      });

    expect(response.status).toBe(401);
  });

  it('returns 404 for a nonexistent user', async () => {
    const response = await request(app).get('/users/999999');

    expect(response.status).toBe(404);
  });

  it('returns 404 for a nonexistent ticket', async () => {
    const response = await request(app).get('/tickets/999999');

    expect(response.status).toBe(404);
  });

  it('supports ticket pagination', async () => {
    const response = await request(app)
      .get('/tickets')
      .query({
        limit: 10,
        offset: 0,
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('supports ticket status filtering', async () => {
    const response = await request(app)
      .get('/tickets')
      .query({
        status: 'TODO',
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

