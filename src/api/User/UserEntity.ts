import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class User extends BaseEntity {

    @PrimaryColumn({ type: 'bigint' })
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

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date

}