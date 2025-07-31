import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { ResponseDto } from "./response.dto";

export interface GenericApiResponseOption<TModel extends Type<any>> {
  model: TModel;
  status?: number;
  description?: string;
  isArray?: boolean;
}

export const GenericApiResponse = (option: GenericApiResponseOption<Type>) => {

  const isArray = option.isArray || false;

  if (isArray) {
    return applyDecorators(
      ApiExtraModels(ResponseDto, option.model),
      ApiResponse({
        status: option.status || 200,
        description: option.description || '성공',
        schema: {
          allOf: [
            { $ref: getSchemaPath(ResponseDto) },
            {
              properties: {
                results: {
                  type: 'array',
                  items: { $ref: getSchemaPath(option.model) },
                },
              },
            },
          ],
        },
      }),
    );
  }

  return applyDecorators(
    ApiExtraModels(ResponseDto, option.model),
    ApiResponse({
      status: option.status || 200,
      description: option.description || '성공',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              results: {
                $ref: getSchemaPath(option.model)
              },
            },
          },
        ],
      },
    }),
  );
};
