import { category } from "@app/internal/enums";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class BlogPostDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsEnum(category)
    @IsNotEmpty()
    category: category;
}
