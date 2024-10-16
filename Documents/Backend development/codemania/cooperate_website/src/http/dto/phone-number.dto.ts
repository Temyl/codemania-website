import PartialInstantiable from '@app/utils/partial-instantiable';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class PhoneNumberDto extends PartialInstantiable<PhoneNumberDto> {
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phone_number: string;
}
