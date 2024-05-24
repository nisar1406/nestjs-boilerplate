import { ApiProperty } from '@nestjs/swagger';

export class UserListDto {
  @ApiProperty({
    description: 'Search by name',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Get latest records on top',
    required: false,
  })
  isRecent?: boolean;

  @ApiProperty({
    description: 'Get all records',
    required: false,
  })
  all?: boolean;

  @ApiProperty({
    description: 'Current page number',
    required: false,
    default: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Total number of records to be retrieved',
    required: false,
    default: 10,
  })
  pageSize?: number;
}
