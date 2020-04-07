import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../User/UserEntity'
import db from '../../db'

@Entity()
export class Log extends BaseEntity {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: string

    @Column()
    type!: 'info' | 'error'

    @Column()
    context!: 'server' | 'api' | 'socket'

    @Column()
    name!: string

    @Column({ type: 'json' })
    data!: any

    @Column({ type: 'varchar', nullable: true })
    identity?: string | number | null

    @ManyToOne(_type => User)
    createdBy?: User

    @CreateDateColumn()
    createdAt!: Date

}

export function prepareLogger(
  type: 'info' | 'error',
  context: 'server' | 'api' | 'socket',
  name: string,
  identity?: string | number | null,
  createdBy?: User
): (data: any) => Promise<Log> | void {
    return (data: any) => {
        return logger(
          type,
          context,
          name,
          data,
          identity,
          createdBy
        )
    }
}

export function logger(
  type: 'info' | 'error',
  context: 'server' | 'api' | 'socket',
  name: string,
  data: any,
  identity?: string | number | null,
  createdBy?: User
): Promise<Log> | void {
    const logData = {
        type,
        context,
        name,
        data,
        identity,
        createdBy
    }
    if (db.connected) {
        const log = Log.create(logData)
        return log.save()
    } else {
        console.error('[OFFLINE LOG]', logData)
    }
}