
// import { Reflector } from '@nestjs/core';

// export const Roles = Reflector.createDecorator<string[]>();

import { SetMetadata } from '@nestjs/common';

export const ResponseMesssage = (message: string) => SetMetadata('response-message', message);

export const SKIP_RESPONSE_TRANSFORM = 'skipResponseTransform';
export const SkipResponseTransform = () => SetMetadata(SKIP_RESPONSE_TRANSFORM, true);