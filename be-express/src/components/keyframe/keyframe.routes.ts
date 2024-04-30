import { Router } from 'express'
import { serveAllImageController } from './keyframe.controller'

const keyframeRouter = Router()

keyframeRouter.get('/images', serveAllImageController)

export default keyframeRouter
