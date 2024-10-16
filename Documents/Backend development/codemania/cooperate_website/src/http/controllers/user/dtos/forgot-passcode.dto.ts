import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  flow_key: string;
}
