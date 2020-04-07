import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { User } from '../User/UserEntity'

@Entity()
export class TweetTrap extends BaseEntity {

    @PrimaryColumn({ type: 'bigint' })
    id!: string

    @Column({ length: 280 })
    text!: string

    @ManyToOne(_type => User)
    createdBy!: User

    @CreateDateColumn()
    createdAt!: Date

}