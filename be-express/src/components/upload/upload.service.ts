import { handleUploadImage, getNewFilename } from "~/helpers/media"
import { Media, MediaType } from "~/collections/media.interface"
import sharp from 'sharp'
import path from 'path'

class UploadService {
    async handleUploadImage(req: Request) {
        const files = await handleUploadImage(req as any)
        const result: Media[] = await Promise.all(
            files.map(async (file) => {
                const newFileName = getNewFilename(file.newFilename)

                await sharp(file.filepath)
                    .jpeg({ quality: 10 })
                    // .resize(200)
                    .toFile(path.resolve('uploads/images', `${newFileName}.jpg`))
                // console.log('Info Media', info)
                return {
                    url: process.env.HOST
                        ? `${process.env.HOST}/static/images/${newFileName}`
                        : `http://localhost:${process.env.PORT || 3000}/static/images/${newFileName}`,
                    type: MediaType.Image
                }
            })
        )
        return result
    }
}
const uploadService = new UploadService()
export default uploadService