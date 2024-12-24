// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { NextFunction, Request, Response } from 'express';
// import * as morgan from 'morgan';

// import { LoggerService } from '../logger/logger.service';

// @Injectable()
// export class MorganMiddleware implements NestMiddleware {
//   constructor(private readonly logger: LoggerService) {}

//   use(req: Request, res: Response, next: NextFunction) {
//     const stream = {
//       write: (message: string) => {
//         const logMessage = message.trim().replace(/\s+/g, ' ');
//         this.logger.info(logMessage);
//         // this.logger.info(message.trim()); // Log the message using your custom logger
//       },
//     };

//     // Use Morgan middleware to log HTTP requests
//     morgan('combined', { stream })(req, res, next);
//   }
// }
