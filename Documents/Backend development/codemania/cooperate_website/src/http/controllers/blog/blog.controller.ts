import { validationPipe } from "@app/http/middlewares/validation.middleware";
import { MIDDLEWARE_TOKENS, SERVICE_TOKENS } from "@app/ioc/tokens";
import { BlogService } from "@app/services/blogs/blog.service";
import { UserService } from "@app/services/user/user.service";
import { inject } from "inversify";
import { controller, httpPatch, httpPost, request, requestBody, requestParam } from "inversify-express-utils";
import { BlogPostDto } from "./dtos/post-blog.dto";
import { ApplicationError } from "@app/internal/errors";
import { StatusCodes } from "http-status-codes";
import { category, FileSize } from "@app/internal/enums";
import { SuccessResponseDto } from "@app/http/dto/http-response.dto";
import { UploadImageDto } from "./dtos/image-post.dto";
import { fileMiddleware, fileTypeFilter } from "@app/http/middlewares/file.middleware";
import { Request } from "express";
import { RequestWithClaims } from "@app/internal/types";
import { editPosttDto } from "./dtos/edit-post.dto";

@controller('/blog')
export class BlogController {
    constructor(
        @inject(SERVICE_TOKENS.UserService)
        private readonly userService: UserService,
        @inject(SERVICE_TOKENS.BlogService)
        private readonly blogService: BlogService
    ) {}

    @httpPost('/blog-post', MIDDLEWARE_TOKENS.AuthMiddleware, validationPipe(BlogPostDto))
    public async blogPost(@request() req: Request, @requestBody() payload: BlogPostDto) {
        const claim = <Record<string, any>>(req as any).claim;
        const user = await this.userService.getById(claim.id);
        console.log(user)

        if (!user) {
            throw new ApplicationError(StatusCodes.CONFLICT, 'User does not exist.');
        }

        const blog = await this.blogService.create({
            user_id: user.id,
            title: payload.title,
            content: payload.content,
            category: <category>payload.category
        });
        console.log(blog);

        return new SuccessResponseDto({ data: blog });
    }

    @httpPatch(
        '/image/:id',
        MIDDLEWARE_TOKENS.AuthMiddleware,
        fileMiddleware(
            'single',
            { fieldName: 'image' },
            { limits: { fileSize: 5 * FileSize.MB }, fileFilter: fileTypeFilter(['.png', '.jpeg', '.jpg']) }
        ),
        validationPipe(UploadImageDto)
    )
    public async imageUpload(
        @request() req: Request,
        @requestBody() payload: UploadImageDto,
        @requestParam() { id }: {  id: string}
    ) {
        if (!req.file && !payload.image) {
            throw new ApplicationError(StatusCodes.BAD_REQUEST, 'Image is required.');
        }

        const claim = (<RequestWithClaims>req).claim;
        const user = await this.userService.getById(claim.id);
        if (!user) {
            throw new ApplicationError(StatusCodes.CONFLICT, 'Account not found.');
        }

        const blog = await this.blogService.getById(id);
        if (!blog) {
            throw new ApplicationError(StatusCodes.NOT_FOUND, 'Blog post not found.');
        }

        let base64Image: string;
        let base64MimeType: string;
        if (!req.file) {
            const imageSplit = payload.image.split(';base64,');
            base64Image = imageSplit[1];
            base64MimeType = imageSplit[0].split(':')[1];
        } else {
            base64Image = Buffer.from(req.file.buffer).toString('base64');
            base64MimeType = req.file.mimetype;
        }

        await this.blogService.update(blog.id, { image: `data:${base64MimeType};base64,${base64Image}` });

        return new SuccessResponseDto({ message: 'Image uploaded successfully' });
    }

    @httpPatch('/blog-post/:id', MIDDLEWARE_TOKENS.AuthMiddleware, validationPipe(editPosttDto))
    public async editPost
    (
        @request() req: Request, 
        @requestBody() payload: editPosttDto,
        @requestParam() { id }: {id: string } 
    ) {
        const claim = (<RequestWithClaims>req).claim;
        const user = await this.userService.getById(claim.id);
        const blog = await this.blogService.getById(id);
        if (!user) {
            throw new ApplicationError(StatusCodes.CONFLICT, 'Account not found.');
        }

        
        if (!blog) {
            throw new ApplicationError(StatusCodes.NOT_FOUND, 'Blog post not found.');
        }

        await this.blogService.update(blog.id, {
            title: payload.title,
            content: payload.content,
            category: <category>payload.category
        });

        return new SuccessResponseDto({ message: 'Post updated successfully' });
    }
}
