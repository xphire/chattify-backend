import {object,string,TypeOf} from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const loginSchema = object({
    email : string().email(),
    password : string().nonempty()
})
.required()
.strict()



export class CreateAuthDto implements TypeOf<typeof loginSchema> {
    @ApiProperty()
    email : string;
    @ApiProperty()
    password : string
}
