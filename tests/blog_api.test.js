const mongoose = require('mongoose')
const supertest = require('supertest')
const { initialBlogs,
  usernameCreator,
  blogsInDb,
  initializeDB } = require('../utils/test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const api = supertest(app)
const jwt = require('jsonwebtoken')

beforeEach(async () => {
  await initializeDB()
})

const getValidToken = async () => {
  const userCreator = await User.findOne({ username: usernameCreator })
  const validUserToken = 'Bearer ' + generateToken({
    username: userCreator.username,
    id: userCreator._id
  })
  return validUserToken
}

const generateToken = (user) => {
  return jwt.sign(user, process.env.SECRET)
}



test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialBlogs.length)

})

test('id must be defined', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})


describe('Create Blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Test',
      author: 'Test Author',
      url: 'https://test.test/',
      likes: 9
    }
    const validUserToken = await getValidToken()

    await api
      .post('/api/blogs')
      .set('Authorization', validUserToken)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()
    const contents = blogsAtEnd.map(b => b.author)

    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
    expect(contents).toContain('Test Author')
  })

  test('a blog without token cant be added', async () => {
    const newBlog = {
      title: 'Test',
      author: 'Test Author',
      url: 'https://test.test/',
      likes: 9
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()

    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })

  test('a blog with invalid token cant be added', async () => {
    const newBlog = {
      title: 'Test',
      author: 'Test Author',
      url: 'https://test.test/',
      likes: 9
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'InvalidToken')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()

    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })

  test('blog without author is not added', async () => {
    const newBlog = {
      title: 'Test',
      url: 'https://test.test/',
      likes: 9
    }

    const validUserToken = await getValidToken()

    await api
      .post('/api/blogs')
      .set('Authorization', validUserToken)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await blogsInDb()

    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })

  test('blog without title cannot be added', async () => {
    const newBlog = {
      author: 'Test Author',
      url: 'https://test.test/',
      likes: 9
    }

    const validUserToken = await getValidToken()

    await api
      .post('/api/blogs')
      .set('Authorization', validUserToken)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await blogsInDb()

    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })

  test('blog without url cannot be added', async () => {
    const newBlog = {
      title: 'Test',
      author: 'Test Author',
      likes: 9
    }

    const validUserToken = await getValidToken()

    await api
      .post('/api/blogs')
      .set('Authorization', validUserToken)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await blogsInDb()

    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })

  test('blog without likes must be added with 0 likes', async () => {
    const newBlog = {
      title: 'Test',
      author: 'Test Author',
      url: 'https://test.test/'
    }

    const validUserToken = await getValidToken()

    const response = await api.post('/api/blogs')
      .send(newBlog)
      .set('Authorization', validUserToken)

    expect(response.body.likes).toBe(0)

  })
})

describe('Delete Blog', () => {
  test('a blog can be deleted', async () => {

    const blogsAtStart = await blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const validUserToken = await getValidToken()


    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', validUserToken)
      .expect(204)

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)

    const ids = blogsAtEnd.map(r => r.id)
    expect(ids).not.toContain(blogToDelete.id)

  })
})

describe('Update Blog', () => {
  test('a blog can be updated', async () => {

    const blogsAtStart = await blogsInDb()
    let blogToUpdate = blogsAtStart[0]

    blogToUpdate.likes = 27

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get(`/api/blogs/${blogToUpdate.id}`)
    const blogUpdated = response.body
    expect(blogUpdated.likes).toBe(27)

  })
})
afterAll(() => {
  mongoose.connection.close()
})