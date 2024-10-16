import { IsNotEmpty, IsString } from 'class-validator';
import { Match } from '@app/http/decorators';

export class resetPasscodeDto {
  @IsNotEmpty()
  @IsString()
  flow_key : string;

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
