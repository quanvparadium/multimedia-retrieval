import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    UpdateDateColumn
} from 'typeorm';
import { Data } from './data.entity';

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

    @OneToMany(() => Data, (data) => data.user)
    data: Data[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
