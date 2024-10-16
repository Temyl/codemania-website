import { IsNotEmpty, IsString } from 'class-validator';
import { Digits } from '@app/http/decorators/digits.decorator';

export class OtpDto {
  @IsString()
  @Digits(6)
  @IsNotEmpty()
  otp: string;
}
