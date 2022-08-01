const mongoose = require('mongoose')
const supertest = require('supertest')
const { usersInDb } = require('../utils/test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')
const api = supertest(app)

describe('Create User', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: '@Test',
      name: 'Test Name',
      password: 'testpass',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('username must be unique', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Root Name ',
      password: 'rootpass',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('username is required', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      name: 'Test Name',
      password: 'testpass',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('username must be bigger than 3 characters', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: '@T',
      name: 'Test Name',
      password: 'testpass',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('password must be bigger than 3 characters', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: '@Test 2',
      name: 'Test Name 2',
      password: 'te',
    }

    const response = await api.post('/api/users').send(newUser)
    const usersAtEnd = await usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
    expect(response.status).toBe(400)
    expect(response.body.error)
      .toContain('password must be at least 3 characters')
  })
})

afterAll(() => {
  mongoose.connection.close()
})