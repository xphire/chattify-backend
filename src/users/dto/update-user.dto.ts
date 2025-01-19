import {object,string,TypeOf} from 'zod';
import { ApiProperty} from '@nestjs/swagger';


export const UpdateUserSchema = object({
    profilePic : string().nonempty()
})
.strict()
.required()

export class UpdateUserDto implements TypeOf<typeof UpdateUserSchema> {
    @ApiProperty()
    profilePic : string;

}
