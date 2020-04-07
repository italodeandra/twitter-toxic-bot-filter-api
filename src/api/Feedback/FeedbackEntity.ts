import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../User/UserEntity'

@Entity()
export class Feedback extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    rate!: number

    @Column({ length: 1500 })
    message!: string

    @ManyToOne(_type => User)
    createdBy!: User

    @CreateDateColumn()
    createdAt!: Date

}