import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  HttpStatus,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { MongoServerError } from 'mongodb';

export default function errorHandler(
  loggerMessage: string,
  serverErrorMessage: string,
  error: Error,
  sourceFunction?: Function,
) {
  console.error(loggerMessage + ': ', error.stack || error);

  const exceptions = [
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
    BadGatewayException,
    NotAcceptableException,
    GoneException,
  ];

  if (exceptions.some((exception) => error instanceof exception)) {
    throw error;
  }

  if (
    error instanceof MongoServerError &&
    sourceFunction &&
    sourceFunction.name === 'createUserController'
  ) {
    throw new HttpException('user already exists', HttpStatus.CONFLICT);
  }

  throw new HttpException(serverErrorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
}
