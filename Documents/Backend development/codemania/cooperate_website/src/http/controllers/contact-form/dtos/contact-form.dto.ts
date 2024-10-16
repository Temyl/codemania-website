import { project_details } from "@app/internal/enums";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class contactFormtDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    company_name: string;

    @IsString()
    @IsNotEmpty()
    project_desc: string;

    @IsEnum(project_details)
    @IsNotEmpty()
    project_details: project_details;
}
