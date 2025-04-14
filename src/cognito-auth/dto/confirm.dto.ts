import { ApiProperty } from '@nestjs/swagger';

export class ConfirmAuthDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  pin: string;
}