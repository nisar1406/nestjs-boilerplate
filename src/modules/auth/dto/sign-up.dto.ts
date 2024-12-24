import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'First name of the user',
    required: true,
    default: 'Jane',
  })
  readonly firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    required: true,
    default: 'Doe',
  })
  readonly lastName: string;

  @ApiProperty({
    description: 'Mobile number of the user',
    required: true,
    default: '9090909090',
  })
  readonly mobile: string;

  @ApiProperty({
    description: 'Email of the user',
    required: true,
    default: 'jane.doe@propertymanagement.com',
  })
  readonly email: string;

  @ApiProperty({
    description: 'Password of the user',
    required: true,
    default: 'password',
  })
  readonly password: string;
}
