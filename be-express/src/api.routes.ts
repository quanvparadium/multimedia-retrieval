import express from 'express';
import authRoutes from './components/auth/auth.routes';
import userRoutes from './components/user/user.routes';
import uploadRoutes from './components/upload/upload.routes';
import folderRoutes from './components/file-system/file-system.routes';
import mediaRouter from './components/media/media.routes';

const apiRoutes = express.Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/uploads', uploadRoutes);
apiRoutes.use('/folders', folderRoutes);
apiRoutes.use('/media', mediaRouter);

export default apiRoutes;
