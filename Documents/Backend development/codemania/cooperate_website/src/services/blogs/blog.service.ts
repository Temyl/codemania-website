import { inject, injectable } from 'inversify';
import { MODULE_TOKENS } from '@app/ioc/tokens';
import { Repository } from '@app/internal/postgres/repository';
import { Blog } from './entities/blog.entity';


export type createBlogData = Partial<
Omit<Blog, 'id' | 'created_at' | 'updated_at'>
>;

export type UpdateBlogData = Partial<createBlogData>

@injectable()
export class BlogService {
    private readonly qb = this.repo.createBuilder('blog')

    constructor(
        @inject(MODULE_TOKENS.Repository) private readonly repo: Repository<Blog>, 
    ) {}

    public async create(data: createBlogData, id?: string): Promise<Blog> {
        return this.qb()
            .insert({ ...data, id: this.repo.id() })
            .returning('*')
            .then(([blog]) => blog);
    }

    public async update(id: string, data: createBlogData): Promise<Blog> {
        return this.qb()
      .where({ id })
      .update(data)
      .returning('*')
      .then(([blog]) => blog);
    }

    public async getByUserId(user_id: string): Promise<Blog> {
        return this.qb()
        .where({ user_id })
        .first('*');
    }

    public async getById(id: string): Promise<Blog> {
        return this.qb().where({ id }).first('*');
      }
    
}


