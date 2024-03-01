import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database.connection';

@Module({})
export class GlobalModule {
  static register(): DynamicModule {
    const providers = [];

    return {
      global: true,
      module: GlobalModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
        }),
      ],
      providers: providers,
      exports: providers,
    };
  }
}
