import { Request } from 'express'
import path from 'path'
import formidable, { File } from 'formidable'

export const UPLOAD_IMAGE_DIR = 'uploads/images'
export const UPLOAD_IMAGE_TEMP = 'uploads/images/temp'

export const UPLOAD_VIDEO_DIR = 'uploads/videos'
export const UPLOAD_VIDEO_TEMP = 'uploads/videos/temp'


export const getNewFilename = (filename: string) => {
    const files = filename.split('.')
    files.pop()
    return files.join('')
}

export const handleUploadImage = async (req: Request) => {
    /**
     * Description: Upload image(s)
     * Metadata: {
     *     size: *** (bytes)
     *     filepath: `${path.resolve('uploads')}`
     *     newFileName: "666178p30***.jpg"
     *     mimetype: "image/jpeg",
     *     mtime: "2024-04-14T07:01:10.991Z" (Created time)
     *     originalFilename: "CCCD.jpg"
     * }
     * Output: File[]
     */
    console.log(path.resolve(UPLOAD_IMAGE_DIR))
    const form = formidable({
        uploadDir: path.resolve(UPLOAD_IMAGE_TEMP),
        maxFiles: 100,
        maxFileSize: 1024 * 1024, // 1 MB
        maxTotalFileSize: 100 * 1024 * 1024, // 100 MB
        keepExtensions: true,
        createDirsFromUploads: true,
        filter: ({ name, originalFilename, mimetype }) => {
            const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
            if (!valid) {
                form.emit('error' as any, new Error('File type is not valid') as any)
            }
            return true
        }
    })
    console.log('handleOK')

    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            console.log('fields', fields)
            console.log('files', files)
            if (err) {
                return reject(err)
            }
            return resolve(files.image as File[]) // Lúc truyền key Postman phải truyền image: test.jpg
        })
    })
}

export const handleUploadVideo = async (req: Request) => {
    /**
     * Description: Upload an video
     * Output: {
     *     size: *** (bytes)
     *     filepath: `${path.resolve('uploads')}`
     *     newFileName: "666178p30***.mp4"
     *     mimetype: "video/jpeg",
     *     mtime: "2024-04-14T07:01:10.991Z" (Created time)
     *     originalFilename: "football.mp4"
     * }
     */
    console.log(path.resolve(UPLOAD_VIDEO_DIR))
    const form = formidable({
        uploadDir: path.resolve(UPLOAD_VIDEO_TEMP),
        maxFiles: 1,
        maxFileSize: 100 * 1024 * 1024, // 50 MB
        keepExtensions: true,
        createDirsFromUploads: true,
        filter: ({ name, originalFilename, mimetype }) => {
            const valid = name === 'video' && Boolean(mimetype?.includes('mp4'))
            if (!valid) {
                form.emit('error' as any, new Error('File type is not valid') as any)
            }
            console.log(mimetype)
            return true
        }
    })

    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            console.log('fields', fields)
            console.log('files', files)
            if (err) {
                return reject(err)
            }
            return resolve(files.video as File[]) // Lúc truyền key Postman phải truyền video: test.mp4
        })
    })
}
