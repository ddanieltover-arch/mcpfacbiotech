import { IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewsletterSubscribeDto {
  @ApiProperty({ example: 'researcher@lab.edu' })
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
