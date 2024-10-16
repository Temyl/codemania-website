import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {

    @IsOptional()
    @IsString()
    image: string;

}
