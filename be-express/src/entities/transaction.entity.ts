import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    beforeBalance: number;

    @Column()
    from: string;

    @Column()
    reason: string;

    @ManyToOne(() => User, (user) => user.transactions)
    user: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
