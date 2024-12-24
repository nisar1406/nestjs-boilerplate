import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'test1@example.com',
    type: String,
  })
  email: string;
}
