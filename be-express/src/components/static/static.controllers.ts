import { NextFunction, Request, Response } from 'express'
import path from 'path'

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    return res.sendFile(path.resolve('uploads/images', id + '.jpg'), (err) => {
        console.log(err)
        if (err) {
            res.status(404).send('Image not found')
        }
    })
}