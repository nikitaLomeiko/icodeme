import { Global, Module } from '@nestjs/common';
import { DatabaseConnectorProvider, DatabaseProvider } from './database';

@Global()
@Module({
  providers: [DatabaseConnectorProvider, DatabaseProvider],
  exports: [DatabaseProvider],
})
export class CoreModule {}
