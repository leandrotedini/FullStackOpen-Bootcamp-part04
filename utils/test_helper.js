const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }
]

const usernameCreator = '@Test'

const initialUsers = [
  {
    username: usernameCreator,
    name: 'Test',
    password: 'testpass'
  },
  {
    username: '@Test2',
    name: 'Test 2',
    password: 'testpass2'
  },
  {
    username: '@Test3',
    name: 'Test 3',
    password: 'testpass3'
  }
]

const initializeDB = async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  await initializeUsers()
  await initializeBlogs()
}

const initializeUsers = async () => {
  const userObjects = await Promise.all(initialUsers
    .map( async user => {
      user.passwordHash = await bcrypt.hash(user.password, 10)
      return new User(user)
    }))
  const promiseArray = userObjects.map(user => user.save())
  await Promise.all(promiseArray)
}

const initializeBlogs = async () => {
  const userCreator = await User.findOne({ username: usernameCreator })
  const blogObjects = initialBlogs
    .map(blog => {
      blog.user = userCreator._id.toString()
      return new Blog(blog)
    })
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}



module.exports = {
  initialBlogs,
  initialUsers,
  usernameCreator,
  blogsInDb,
  usersInDb,
  initializeDB
}