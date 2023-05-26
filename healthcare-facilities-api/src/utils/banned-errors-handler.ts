import { NotFoundException } from '@nestjs/common';

export const BannedErrorHandler = (exception: Error) => {
  const bannedErrors = [NotFoundException];
  let banned = false;
  for (const error of bannedErrors) {
    if (exception instanceof error) {
      banned = true;
    }
  }
  return banned;
};
