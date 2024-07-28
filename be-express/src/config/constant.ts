export const REFRESH_TOKEN_TIME = '30d';
export const ACCESS_TOKEN_TIME = '1d';

export const HTTPSTATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    PARTIAL_CONTENT: 206,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
} as const;

export const UPLOAD_IMAGE_DIR = 'uploads/images';
export const UPLOAD_IMAGE_TEMP = 'uploads/images/temp';

export const UPLOAD_VIDEO_DIR = 'uploads/videos';
export const UPLOAD_VIDEO_TEMP = 'uploads/videos/temp';

export const STORE_DIR = `${__dirname.replace(/\\/g, "/")}/../../store`;
export const UPLOAD_STORE_DIR = `${__dirname.replace(/\\/g, "/")}/../../store/uploads`;
export const UPLOAD_TEMP_DIR = 'store/temp';
