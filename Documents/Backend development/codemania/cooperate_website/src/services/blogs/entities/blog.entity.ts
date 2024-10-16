import { category } from '@app/internal/enums';
import { BaseEntity } from '@app/internal/postgres/base.entity';

export class Blog extends BaseEntity<Blog> {
  user_id: string;
  title: string;
  content: string;
  image: string;
  category: category;
}

