import { Router } from 'express'
import {
    serveImageController,
    // serveVideoController,
    // serveVideoStreamController
} from './static.controllers'

const staticRouter = Router()

staticRouter.get('/images/:id', serveImageController)
// staticRouter.get('/videos/:id', serveVideoController)
// staticRouter.get('/videos-stream/:id', serveVideoStreamController)

export default staticRouter
