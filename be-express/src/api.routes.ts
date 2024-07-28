import express from 'express';
import authRoutes from './components/auth/auth.routes';
import userRoutes from './components/user/user.routes';
import uploadRoutes from './components/upload/upload.routes';
import folderRoutes from './components/file-system/file-system.routes';
import mediaRouter from './components/media/media.routes';
import thumbnailRouter from './components/thumbnail/thumbnail.routes';
import logRoutes from './components/log/log.routes';
import searchRoutes from './components/search/search.routes';
import keyframeRouter from './components/keyframe/keyframe.routes';

const apiRoutes = express.Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/uploads', uploadRoutes);
apiRoutes.use('/folders', folderRoutes);
apiRoutes.use('/media', mediaRouter);
apiRoutes.use('/thumbnails', thumbnailRouter);
apiRoutes.use('/logs', logRoutes);
apiRoutes.use('/search', searchRoutes);
apiRoutes.use('/keyframes', keyframeRouter);


export default apiRoutes;
