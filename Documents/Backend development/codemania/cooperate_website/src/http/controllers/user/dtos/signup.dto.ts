import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  passcode: string;
}
