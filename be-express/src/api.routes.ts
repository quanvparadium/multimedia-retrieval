import express from 'express';
import authRoutes from './components/auth/auth.routes';
import userRoutes from './components/user/user.routes';
import folderRoutes from './components/file-system/file-system.routes';

const apiRoutes = express.Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/folders', folderRoutes);

export default apiRoutes;
