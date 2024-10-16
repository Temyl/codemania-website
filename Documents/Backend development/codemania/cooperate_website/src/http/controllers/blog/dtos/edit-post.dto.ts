import { category } from "@app/internal/enums";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class editPosttDto {

    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsOptional()
    content: string;

    @IsEnum(category)
    @IsNotEmpty()
    category: category;
}
