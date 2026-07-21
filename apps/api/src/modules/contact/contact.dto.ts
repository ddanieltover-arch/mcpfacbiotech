import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactMessageDto {
  @ApiProperty({ example: 'Dr. Jane Smith' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'jane@lab.edu' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({ example: 'University Research Lab' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;

  @ApiProperty({ example: 'Product inquiry' })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  subject!: string;

  @ApiProperty({ example: 'Please share specifications and lead time.' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;
}
