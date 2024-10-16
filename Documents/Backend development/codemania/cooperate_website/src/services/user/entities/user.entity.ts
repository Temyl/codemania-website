import { BaseEntity } from '@app/internal/postgres/base.entity';

export class User extends BaseEntity<User> {
  email: string;
  passcode: string;
  full_name: string;
}

