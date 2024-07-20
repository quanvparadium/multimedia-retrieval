import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
@Entity()
export class QueryHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    queryMetaData: string;

    @Column()
    type: string;

    @Column()
    message: string;

    @ManyToOne(() => User, (user) => user.queryHistories)
    user: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
