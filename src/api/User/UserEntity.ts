import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class User extends BaseEntity {

    @PrimaryColumn()
    id!: string

    @Column()
    screenName!: string

    @Column()
    accessToken!: string

    @Column()
    accessTokenSecret!: string

    @Column()
    name?: string

    @Column()
    profileImageUrl?: string

}