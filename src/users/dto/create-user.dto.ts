import {object, string, TypeOf} from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateUserSchema = object({
    firstName : string().nonempty(),
    lastName : string().nonempty(),
    email : string().email(),
    password : string().nonempty().min(8)
})
.required()
.strict()
.extend({
    profilePic : string().optional().default("")
})
.strict()


export const FetchUserSchema = object({
    id : string().nonempty(),
    email : string().email()
})
.strict()
.partial()
.refine((fields) => Object.keys(fields).length === 1,{
    message : 'kindly provide one of id or email as the only query param'
})

//DTOs are recommended to be classes by the docs
export class CreateUserDto implements TypeOf<typeof CreateUserSchema>  {
    @ApiProperty()
    firstName : string;
    @ApiProperty()
    email : string;
    @ApiProperty()
    lastName : string;
    @ApiProperty()
    password : string;
    @ApiProperty({required : false})
    profilePic : string
}

export class FetchUserDto implements TypeOf<typeof FetchUserSchema> {
    @ApiProperty({required : false})
    id : string;
    @ApiProperty({required : false})
    email : string;
}
