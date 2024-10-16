import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Digits } from '@app/http/decorators';
import { Match } from '@app/http/decorators';

export class ResetPasscodeDto {
  @IsOptional()
  @IsString()
  otp : string;


  @IsString()
  @IsNotEmpty()
  new_passcode: string;

  @IsString()
  @Match('new_passcode', {
    message: 'passcode must match',
  })
  @IsNotEmpty()
  confirm_passcode: string;
}

export class PasscodeDto {
  @IsString()
  @Digits(6)
  @IsNotEmpty()
  passcode: string;

  @IsString()
  @Match('passcode', {
    message: 'passcode must match',
  })
  @IsNotEmpty()
  confirm_passcode: string;
}

