import { ApiProperty } from "@nestjs/swagger"

export class RegisterAuthDto { 
    @ApiProperty()
    userName: string
    @ApiProperty()
    email: string
    @ApiProperty()
    password: string
}