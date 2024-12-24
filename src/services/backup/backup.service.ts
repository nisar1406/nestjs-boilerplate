import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as path from 'path';

import { AllConfigType } from '../../configs';
import { IUser } from '../../model';
import { USERS } from '../../utils/constants/model-names';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class BackupService {
  constructor(
    @InjectModel(USERS)
    private readonly _userModel: Model<IUser>,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly loggerService: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleCron() {
    try {
      await this.createBackup();
    } catch (error) {
      this.loggerService.error(
        `Error in scheduled backup task: ${error.message}`,
        error,
      );
    }
  }

  async createBackup(): Promise<void> {
    try {
      const BACKUP_PATH = path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'backup',
      );

      const backupFolder = path.join(
        BACKUP_PATH,
        new Date().toISOString().split('T')[0],
      );

      if (!fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder, { recursive: true });
      }

      try {
        await this.backupModel(this._userModel, USERS, backupFolder);

        try {
          this.deleteOldBackups(BACKUP_PATH);
        } catch (deleteError) {
          console.log(deleteError, 'backup delete error');

          this.loggerService.error(
            `Error deleting old backups: ${deleteError.message}`,
            deleteError,
          );
        }

        this.loggerService.info(
          `Backups created successfully in folder: ${backupFolder}`,
        );
      } catch (error) {
        this.loggerService.error(
          `Error during backup creation: ${error.message}`,
          error,
        );
      }
    } catch (error) {
      console.log(error, 'backup create error');

      this.loggerService.error(
        `Error during backup creation: ${error.message}`,
        error,
      );
    }
  }

  private async backupModel(
    model: Model<any>,
    modelName: string,
    backupFolder: string,
  ): Promise<void> {
    const data = await model.find().lean().exec();
    const backupFile = path.join(backupFolder, `${modelName}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    this.loggerService.info(`Backup created for ${modelName}: ${backupFile}`);
  }

  private deleteOldBackups(backupPath: string): void {
    try {
      const maxBackups = 5; // Number of backups to keep
      const folders = fs.readdirSync(backupPath).filter((file) => {
        return fs.statSync(path.join(backupPath, file)).isDirectory();
      });

      if (folders.length > maxBackups) {
        folders.sort();
        const foldersToDelete = folders.slice(0, folders.length - maxBackups);

        for (const folder of foldersToDelete) {
          const folderPath = path.join(backupPath, folder);
          fs.rmSync(folderPath, { recursive: true, force: true });
          this.loggerService.info(`Deleted old backup: ${folderPath}`);
        }
      }
    } catch (error) {
      console.log(error, 'old backup create error');

      this.loggerService.error(
        `Error during deletion of old backups: ${error.message}`,
        error.stack,
      );
    }
  }
}
