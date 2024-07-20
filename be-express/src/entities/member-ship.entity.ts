import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn } from 'typeorm';
import { Subscribe } from './subscribe.entity';

@Entity()
export class Membership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    duration: number; // Duration in months or any other appropriate unit

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number; // Assuming the price is a decimal number

    @Column({ unique: true })
    name: string;

    @Column()
    description: string;

    @Column()
    maxStorage: number;

    @OneToMany(() => Subscribe, (subscribe) => subscribe.membership)
    subscriptions: Subscribe[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
