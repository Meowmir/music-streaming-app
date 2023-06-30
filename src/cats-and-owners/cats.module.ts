import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CatsController } from './cats/cats.controller';
import { Cat, CatSchema } from './schemas/cat.schema';
import { OwnersService } from './owners/owners.service';
import { OwnersController } from './owners/owners.controller';
import { Owner, OwnerSchema } from './schemas/owner.schema';
import { CatsService } from './cats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cat.name, schema: CatSchema },
      { name: Owner.name, schema: OwnerSchema },
    ]),
  ],
  providers: [CatsService, OwnersService],
  controllers: [CatsController, OwnersController],
})
export class CatsModule {}
