import { Module } from '@nestjs/common';
import { Natura2000Controller } from './natura2000.controller';
import { Natura2000Service } from './natura2000.service';

@Module({
  controllers: [Natura2000Controller],
  providers: [Natura2000Service],
  exports: [Natura2000Service],
})
export class Natura2000Module {}
