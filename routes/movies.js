const express = require('express')
const passport = require('passport')
const MoviesServices = require('../services/movies')

const { movieIdSchema, createMovieSchema, updateMovieSchema } = require('../utils/schemas/movies')
const validationHandler = require('../utils/middleware/validationHandler')

//Cache
const cacheResponse = require('../utils/cacheResponse')
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require('../utils/time')

// JWT strategy
require('../utils/auth/strategies/jwt')

function moviesApi(app) {
  const router = express.Router()
  app.use('/api/movies', router)

  const movieServices = new MoviesServices()

  router.get('/', 
    passport.authenticate('jwt', { session: false }), 
    async function (req, res, next) {
      cacheResponse(res, FIVE_MINUTES_IN_SECONDS)
      const { tags } = req.query
      try {
        const movies = await movieServices.getMovies({ tags })
          res.status(200).json({
            data: movies,
            message: 'Movies listed'
          })
      } catch (err) {
        next(err)
      }
    }
  )

  router.get('/:movieId', 
    passport.authenticate('jwt', { session: false }), 
    validationHandler({ movieId: movieIdSchema }, 'params'), 
    async function (req, res, next) {
      cacheResponse(res, SIXTY_MINUTES_IN_SECONDS)
      const { movieId } = req.params
      try {
        const movie = await movieServices.getMovie({ movieId })
          res.status(200).json({
            data: movie,
            message: 'Movie retrieved'
          })
      } catch (err) {
        next(err)
      }
    }
  )

  router.post('/', 
    passport.authenticate('jwt', { session: false }), 
    validationHandler(createMovieSchema), 
    async function (req, res, next) {
      const { body: movie } = req
      try {
        const createdMovieId = await movieServices.createMovie({ movie })
          res.status(201).json({
            data: createdMovieId,
            message: 'Movie created'
          })
      } catch (err) {
        next(err)
      }
    }
  )

  router.put('/:movieId', 
  passport.authenticate('jwt', { session: false }), 
    validationHandler({ movieId: movieIdSchema }, 'params'), 
    validationHandler(updateMovieSchema), 
    async function (req, res, next) {
      const { movieId } = req.params
      const { body: movie } = req
      try {
        const updatedMovieId = await movieServices.updateMovie({ movieId, movie })
          res.status(200).json({
            data: updatedMovieId,
            message: 'Movie updated'
          })
      } catch (err) {
        next(err)
      }
    }
  )

  router.delete('/:movieId', 
    passport.authenticate('jwt', { session: false }), 
    validationHandler({ movieId: movieIdSchema }, 'params'), 
    async function (req, res, next) {
      const { movieId } = req.params
      try {
        const deletedMovieId = await movieServices.deleteMovie({ movieId })
          res.status(200).json({
            data: deletedMovieId,
            message: 'Movie deleted'
          })
      } catch (err) {
        next(err)
      }
    }
  )
}

module.exports = moviesApi
