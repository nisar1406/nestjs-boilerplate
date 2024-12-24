import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JoiValidationPipe } from '../../pipes';
import { idParamSchema } from '../users/validation/schema';
import { CreateFileDto } from './dto/create-file.dto';
import { FileService } from './file.service';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiOkResponse({
    description: 'The file has been successfully uploaded.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid file upload request.',
  })
  create(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Invalid file upload request.');
    }
    const createFileDto: CreateFileDto = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    };
    return this.fileService.create(createFileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file by ID' }) // Adding operation summary
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the file to delete',
  })
  @ApiOkResponse({
    description: 'File successfully deleted.',
  })
  @UsePipes(new JoiValidationPipe(idParamSchema, null))
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }
}
