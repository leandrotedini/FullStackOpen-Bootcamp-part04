const mongoose = require('mongoose')
const supertest = require('supertest')
const { initialBlogs, blogsInDb } = require('../utils/test_helper')
const Blog = require('../models/blog')
const app = require('../app')
const api = supertest(app)


beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

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

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blogsInDb()
    const contents = blogsAtEnd.map(b => b.author)

    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
    expect(contents).toContain('Test Author')
  })

  test('blog without author is not added', async () => {
    const newBlog = {
      title: 'Test',
      url: 'https://test.test/',
      likes: 9
    }

    await api
      .post('/api/blogs')
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

    await api
      .post('/api/blogs')
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

    await api
      .post('/api/blogs')
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

    const response = await api.post('/api/blogs').send(newBlog)
    expect(response.body.likes).toBe(0)
  })
})

describe('Delete Blog', () => {
  test('a blog can be deleted', async () => {

    const blogsAtStart = await blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await blogsInDb()
    expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)

    const ids = blogsAtEnd.map(r => r.id)
    expect(ids).not.toContain(blogToDelete.id)

  })
})

afterAll(() => {
  mongoose.connection.close()
})