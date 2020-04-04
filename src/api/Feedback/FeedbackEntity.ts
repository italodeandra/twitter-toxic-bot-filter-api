import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Feedback extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    rate!: number

    @Column({ length: 1500 })
    message!: string

}