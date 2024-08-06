import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    UpdateDateColumn,
    OneToOne
} from 'typeorm';
import { Data } from './data.entity';
import { Subscribe } from './subscribe.entity';
import { Transaction } from './transaction.entity';
import { QueryHistory } from './query-history.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20 })
    name: string;

    @Column({ length: 45, unique: true })
    email: string;

    @Column({ length: 80 })
    password: string;

    @Column({ default: 0 })
    balance: number;

    @Column({ length: 200, default: '' })
    avatar: string;

    @OneToMany(() => Data, (data) => data.user)
    data: Data[];

    @OneToOne(() => Subscribe, (subscribe) => subscribe.user)
    subscription: Subscribe;

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[];

    @OneToMany(() => QueryHistory, (queryHistory) => queryHistory.user)
    queryHistories: QueryHistory[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
