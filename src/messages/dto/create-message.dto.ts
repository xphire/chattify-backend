import {object, string, TypeOf} from 'zod';
import { ApiProperty } from '@nestjs/swagger';


export const CreateMessageSchema = object({
    text : string(),
    image : string().nullable()
})
.strict()
.partial()
.refine((fields) => Object.keys(fields).length >= 1,{
    message : 'kindly provide a text or an image'
})

export const ImageUrlSchema = string().url()


export class CreateMessageDto implements TypeOf<typeof CreateMessageSchema> {
    @ApiProperty()
    text : string;
    @ApiProperty()
    image : string
}
