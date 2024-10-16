import PartialInstantiable from '@app/utils/partial-instantiable';

export class HttpResponseDto<T = any> extends PartialInstantiable<
  HttpResponseDto<T>
> {
  message: string;
  data?: T;
}

export class SuccessResponseDto<T = any> extends HttpResponseDto<T> {
  message = 'success';
}
