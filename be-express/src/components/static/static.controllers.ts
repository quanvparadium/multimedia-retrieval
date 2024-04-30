import { NextFunction, Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { UPLOAD_VIDEO_DIR } from '~/helpers/media'
import { HTTPSTATUS } from '~/config/constant'

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    return res.sendFile(path.resolve('uploads/images', id + '.jpg'), (err) => {
        console.log(err)
        if (err) {
            res.status(HTTPSTATUS.NOT_FOUND).send('Image not found')
        }
    })
}

export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
    const range = req.headers.range
    if (!range) {
        res.status(HTTPSTATUS.BAD_REQUEST).send('Require Range header')
    }
    const { id } = req.params
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, id)

    // Dung lượng video (bytes)
    const videoSize = fs.statSync(videoPath).size

    // Dung lượng video cho mỗi phân đoạn stream
    const chunkSize = 10 ** 6

    // Lấy giá trị bắt đầu từ header Range
    const start = Number(range?.replace(/\D/g, ''))

    // Lấy giá trị byte kết thúc 
    const end = Math.min(start * chunkSize, videoSize - 1)
    const contentLength = end - start + 1
    const contentType = 'video/*'
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': contentType
    }
    res.writeHead(HTTPSTATUS.PARTIAL_CONTENT, headers)
    const videoStreams = fs.createReadStream(videoPath, { start, end })
    videoStreams.pipe(res)
}