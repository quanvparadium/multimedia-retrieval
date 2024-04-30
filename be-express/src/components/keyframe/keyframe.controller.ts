import { NextFunction, Request, Response, json } from 'express'
import path from 'path'
import fs from 'fs'
interface KeyframeOutput {
    [key: string]: string[]
}
const KEYFRAME_DIR = path.resolve(process.cwd(), '../services/features/keyframe_id.json')
export const serveAllImageController = (req: Request, res: Response, next: NextFunction) => {
    const keyframe = req.query.keyframe
    const video = req.query.video
    const index = req.query.index

    fs.readFile(KEYFRAME_DIR, 'utf8', (err, data) => {
        if (err) {
            console.error('Đã xảy ra lỗi khi đọc file:', err)
            return {
                message: 'Error'
            }
        }

        // Xử lý dữ liệu trong file ở đây
        data = JSON.parse(data)

        if (keyframe && video && index) {
            res.sendFile(
                path.resolve(
                    data[`L${keyframe.toString().padStart(2, '0')}_V0${video.toString().padStart(2, '0')}` as any][index as any]
                ),
                (err) => {
                    console.log(err)
                    if (err) {
                        res.status(404).send('Image not found')
                    }
                }
            )
        } else {
            const result: string[] = []
            const dataObj = Object.entries(data)
            dataObj.forEach(([key, value]) => {
                // console.log(`Key: ${key}`)
                for (const [idx, _] of Object(value).entries()) {
                    result.push(
                        `keyframe=${key.split('_')[0][2]}&video=${Number(key.split('_')[1].slice(2, 4))}&index=${idx}`
                    )
                }
            })

            res.json(result)
        }
    })

}
