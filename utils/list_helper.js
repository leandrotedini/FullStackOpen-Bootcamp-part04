var _ = require('lodash')

const dummy = (blogs) => {

  return 1
}

const totalLikes = (blogs = []) => {

  return blogs.length === 0
    ? 0
    : blogs.reduce( (acc, item) => {
      return acc = acc + item.likes
    }, 0)
}

const favoriteBlog = (blogs = []) => {

  if (blogs.length === 0) return null

  const { _id, url, __v, ...favoriteBlog } = blogs.reduce( (previousValue, currentValue) => {
    return previousValue.likes <  currentValue.likes
      ? currentValue
      : previousValue
  })

  return favoriteBlog
}

// i dont like at all what i did with this functions
//but at least i tried to use Lodash library and it works :)

const mostBlogs = (blogs = []) => {

  if (blogs.length === 0) return null

  const result = _.groupBy(blogs, 'author')
  const resultSorted = _.sortBy(result, result.length)
  const collectionOfMostComented = _.last(resultSorted)
  const { author } = collectionOfMostComented[0]
  const numberOfBlogs = collectionOfMostComented.length

  return { author: author, blogs: numberOfBlogs }
}

const mostLikes = (blogs = []) => {

  if (blogs.length === 0) return null

  const { author } = favoriteBlog(blogs)

  const likes = _.filter(blogs, { 'author': author })
    .reduce( (previousValue, currentValue) => {
      let totalLikes
      totalLikes = previousValue.likes + currentValue.likes
      return totalLikes
    })

  return { author: author, likes: likes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}