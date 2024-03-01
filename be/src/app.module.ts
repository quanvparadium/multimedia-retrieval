import { Module } from '@nestjs/common';
import { UserModule } from './components/user/user.module';
import { GlobalModule } from './global/global.module';

@Module({
  imports: [UserModule, GlobalModule.register()],
})
export class AppModule {}
